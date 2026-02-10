import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getProducts,
  getRawMaterials,
  getProductRawMaterials,
  createProductRawMaterial,
  deleteProductRawMaterial,
} from "../../services/api";
import { Receipt, Trash2, PlusCircle } from "lucide-react";

export default function Recipes() {
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // form
  const [productId, setProductId] = useState("");
  const [rawMaterialId, setRawMaterialId] = useState("");
  const [quantityRequired, setQuantityRequired] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [p, rm, bom] = await Promise.all([
        getProducts(),
        getRawMaterials(),
        getProductRawMaterials(),
      ]);

      setProducts(Array.isArray(p) ? p : []);
      setRawMaterials(Array.isArray(rm) ? rm : []);
      setItems(Array.isArray(bom) ? bom : []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao carregar receitas (BOM).");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canSave = useMemo(() => {
    const q = Number(quantityRequired);
    return (
      String(productId).trim() &&
      String(rawMaterialId).trim() &&
      !Number.isNaN(q) &&
      q > 0
    );
  }, [productId, rawMaterialId, quantityRequired]);

  const productById = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const rawMaterialById = useMemo(() => {
    const map = new Map();
    rawMaterials.forEach((rm) => map.set(rm.id, rm));
    return map;
  }, [rawMaterials]);

  async function onCreate() {
    if (!canSave) return;

    // opcional: evita duplicar produto+insumo
    const exists = items.some(
      (x) =>
        Number(x.product_id) === Number(productId) &&
        Number(x.raw_material_id) === Number(rawMaterialId)
    );
    if (exists) {
      setError("Esse produto já possui esse insumo cadastrado na BOM.");
      return;
    }

    try {
      setBusy(true);
      setError("");

      await createProductRawMaterial({
        product_id: Number(productId),
        raw_material_id: Number(rawMaterialId),
        quantity_required: Number(quantityRequired),
      });

      setProductId("");
      setRawMaterialId("");
      setQuantityRequired("");
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao salvar BOM.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Deseja excluir esta receita (BOM)?");
    if (!ok) return;

    try {
      setBusy(true);
      setError("");
      await deleteProductRawMaterial(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao excluir BOM.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-10">
      <div className="max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Receitas (BOM)
            </h1>
            <p className="text-slate-500 mt-1">
              Vincule um produto a um insumo e defina a quantidade necessária por
              unidade produzida.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading || busy}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-bold transition-all"
          >
            Recarregar
          </button>
        </header>

        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 mb-6">
            <p className="font-bold">Ops!</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : null}

        {/* FORM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="text-blue-600" size={18} />
            <h2 className="font-bold text-slate-900">Nova receita (BOM)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Selecione o produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>

            <select
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              value={rawMaterialId}
              onChange={(e) => setRawMaterialId(e.target.value)}
            >
              <option value="">Selecione o insumo</option>
              {rawMaterials.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.code} — {rm.name}
                </option>
              ))}
            </select>

            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Quantidade necessária (ex: 4)"
              value={quantityRequired}
              onChange={(e) => setQuantityRequired(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onCreate}
              disabled={!canSave || busy}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200"
            >
              {busy ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        {/* LISTA */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <Receipt className="text-slate-500" size={18} />
            <h2 className="font-bold text-slate-900">Lista de receitas (BOM)</h2>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">Carregando...</div>
          ) : items.length ? (
            <div className="divide-y divide-slate-100">
              {items.map((x) => {
                const p = productById.get(x.product_id);
                const rm = rawMaterialById.get(x.raw_material_id);

                return (
                  <div
                    key={x.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {p ? `${p.name}` : `Produto #${x.product_id}`}
                      </p>
                      <p className="text-sm text-slate-500">
                        {p?.code ? `${p.code} • ` : ""}
                        {rm ? `${rm.name} (${rm.code})` : `Insumo #${x.raw_material_id}`}
                        {" • "}
                        Necessário:{" "}
                        <span className="font-bold text-slate-700">
                          {Number(x.quantity_required ?? 0)}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDelete(x.id)}
                      disabled={busy}
                      className="text-rose-600 hover:text-rose-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
                    >
                      <Trash2 size={16} />
                      Excluir
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-slate-600">
              Nenhuma receita cadastrada ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
