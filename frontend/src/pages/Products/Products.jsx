import React, { useEffect, useMemo, useState, useCallback } from "react";
import { getProducts, createProduct, deleteProduct } from "../../services/api";
import { Package, Trash2, PlusCircle } from "lucide-react";

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canSave = useMemo(() => {
    const p = Number(value);
    return code.trim() && name.trim() && !Number.isNaN(p);
  }, [code, name, value]);

  async function onCreate() {
    if (!canSave) return;

    try {
      setBusy(true);
      setError("");

      await createProduct({
        code: code.trim(),
        name: name.trim(),
        value: Number(value),
      });

      setCode("");
      setName("");
      setValue("");
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao criar produto.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Deseja excluir este produto?");
    if (!ok) return;

    try {
      setBusy(true);
      setError("");
      await deleteProduct(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao excluir produto.");
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
              Produtos
            </h1>
            <p className="text-slate-500 mt-1">
              Cadastre seus produtos com código e preço.
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
            <h2 className="font-bold text-slate-900">Novo produto</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Código (ex: P001)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Nome do produto"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Preço (ex: 10.50)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
            <Package className="text-slate-500" size={18} />
            <h2 className="font-bold text-slate-900">Lista de produtos</h2>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">Carregando...</div>
          ) : items.length ? (
            <div className="divide-y divide-slate-100">
              {items.map((p) => (
                <div
                  key={p.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-sm text-slate-500">
                      {p.code} • R$ {Number(p.value || 0).toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    disabled={busy}
                    className="text-rose-600 hover:text-rose-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-slate-600">
              Nenhum produto cadastrado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
