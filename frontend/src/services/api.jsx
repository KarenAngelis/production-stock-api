// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

/**
 * Normaliza erros do FastAPI:
 * - 422: detail costuma vir como array [{loc,msg,type}]
 * - pode vir como string/object
 */
function normalizeErrorMessage(data, fallback) {
  if (!data) return fallback;

  // FastAPI típico: { detail: [...] } ou { detail: "..." }
  const detail = data.detail ?? data.message ?? data.error;

  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const loc = Array.isArray(d.loc) ? d.loc.join(".") : "";
        const msg = d.msg || d.message || JSON.stringify(d);
        return loc ? `${loc}: ${msg}` : msg;
      })
      .join(" | ");
  }

  if (typeof detail === "string") return detail;
  if (typeof detail === "object") return JSON.stringify(detail);

  if (typeof data === "object") return JSON.stringify(data);

  return String(data);
}

/**
 * helper: monta URL + trata JSON/erros
 */
async function fetchJson(path, options = {}) {
  const url = `${API_URL}${path}`;

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Só seta Content-Type quando existe body
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // 204 = sem corpo
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  // lê corpo UMA vez
  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const fallback = `Erro ${res.status} ao chamar ${path}`;

    if (!isJson) {
      const msg = typeof data === "string" && data.trim() ? data : fallback;
      throw new Error(msg);
    }

    const msg = normalizeErrorMessage(data, fallback);
    throw new Error(msg || fallback);
  }

  return data;
}

/* =========================
   DASHBOARD / SUGESTÕES
========================= */
export function getProductionSuggestions() {
  return fetchJson("/production/suggestion");
}

/* =========================
   PRODUTOS
========================= */
export function getProducts() {
  return fetchJson("/products/");
}

export function createProduct(payload) {
  return fetchJson("/products/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id) {
  return fetchJson(`/products/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   INSUMOS (RAW MATERIALS)
========================= */
export function getRawMaterials() {
  return fetchJson("/raw-materials/");
}

export function createRawMaterial(payload) {
  return fetchJson("/raw-materials/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteRawMaterial(id) {
  return fetchJson(`/raw-materials/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   RECEITAS / BOM (Product Raw Materials)
========================= */
export function getProductRawMaterials() {
  return fetchJson("/product-raw-materials/");
}

export function createProductRawMaterial(payload) {
  return fetchJson("/product-raw-materials/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteProductRawMaterial(id) {
  return fetchJson(`/product-raw-materials/${id}`, {
    method: "DELETE",
  });
}

/* =========================
   MOVIMENTAÇÕES (STOCK MOVEMENTS)
========================= */
export function getStockMovements() {
  return fetchJson("/stock-movements/");
}

export function createStockMovement(payload) {
  return fetchJson("/stock-movements/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
