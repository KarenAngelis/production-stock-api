// Explicit browser-only portfolio mode. The real API is used unless enabled at build time.
const KEY = 'stockmaster-demo-v1';
const seed = () => ({
  products: [
    { id: 1, code: 'DEMO-001', name: 'Mesa modular — demonstração', value: 450, stock_quantity: 0 },
    { id: 2, code: 'DEMO-002', name: 'Prateleira — demonstração', value: 120, stock_quantity: 0 },
  ],
  'raw-materials': [
    { id: 1, code: 'MAT-001', name: 'Painel de madeira fictício', stock_quantity: 30 },
    { id: 2, code: 'MAT-002', name: 'Kit de fixação fictício', stock_quantity: 50 },
  ],
  'product-raw-materials': [
    { id: 1, product_id: 1, raw_material_id: 1, quantity_required: 3 },
    { id: 2, product_id: 1, raw_material_id: 2, quantity_required: 2 },
    { id: 3, product_id: 2, raw_material_id: 1, quantity_required: 1 },
  ],
  'stock-movements': [],
});

export async function demoRequest(path, options = {}) {
  const stored = sessionStorage.getItem(KEY);
  const data = stored ? JSON.parse(stored) : seed();
  const [resource, rawId] = path.split('/').filter(Boolean);
  const method = options.method || 'GET';
  if (resource === 'production' && rawId === 'suggestion') {
    const stock = Object.fromEntries(data['raw-materials'].map(item => [item.id, item.stock_quantity]));
    const products = [];
    for (const product of [...data.products].sort((a, b) => b.value - a.value)) {
      const recipe = data['product-raw-materials'].filter(item => item.product_id === product.id);
      if (!recipe.length || recipe.some(item => item.quantity_required <= 0)) continue;
      const quantity = Math.min(...recipe.map(item => Math.floor((stock[item.raw_material_id] || 0) / item.quantity_required)));
      if (quantity <= 0) continue;
      recipe.forEach(item => { stock[item.raw_material_id] -= quantity * item.quantity_required; });
      products.push({ product_id: product.id, product_code: product.code, product_name: product.name, unit_value: product.value, quantity_possible: quantity, total_value: Math.round(product.value * quantity * 100) / 100 });
    }
    return { products, total_production_value: products.reduce((total, item) => total + item.total_value, 0) };
  }
  if (!Object.prototype.hasOwnProperty.call(data, resource)) throw new Error('Unknown demo resource');
  const list = data[resource];
  if (method === 'GET') return JSON.parse(JSON.stringify(list));
  let result = null;
  if (method === 'DELETE') {
    const id = Number(rawId);
    if (resource === 'products' || resource === 'raw-materials') {
      const key = resource === 'products' ? 'product_id' : 'raw_material_id';
      if (data['product-raw-materials'].some(item => item[key] === id)) throw new Error('Remove the related recipe before deleting this demo item.');
    }
    data[resource] = list.filter(item => item.id !== id);
  } else if (method === 'POST') {
    const payload = JSON.parse(options.body);
    const id = Math.max(0, ...list.map(item => item.id)) + 1;
    if (resource === 'stock-movements') {
      const quantity = Number(payload.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be positive.');
      const items = payload.item_type === 'product' ? data.products : data['raw-materials'];
      const item = items.find(entry => entry.id === Number(payload.item_id));
      if (!item) throw new Error('Item not found.');
      const current = Number(item.stock_quantity || 0);
      if (payload.movement_type === 'out' && current < quantity) throw new Error('Insufficient stock.');
      if (!['in', 'out', 'adjust'].includes(payload.movement_type)) throw new Error('Invalid movement type.');
      item.stock_quantity = payload.movement_type === 'in' ? current + quantity : payload.movement_type === 'out' ? current - quantity : quantity;
      result = { ...payload, id, created_at: new Date().toISOString() };
    } else {
      if (payload.code && list.some(item => item.code === payload.code)) throw new Error('This code already exists.');
      result = { stock_quantity: 0, ...payload, id };
    }
    list.push(result);
  } else throw new Error('Unsupported demo operation');
  // Write once after successful validation; each tab has independent fictional data.
  sessionStorage.setItem(KEY, JSON.stringify(data));
  return result;
}
