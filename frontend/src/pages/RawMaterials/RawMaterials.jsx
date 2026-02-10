import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRawMaterials,
  createRawMaterial,
  deleteRawMaterial,
} from "../../services/api";
import { Droplets, Trash2, PlusCircle } from "lucide-react";

export default function RawMaterials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getRawMaterials();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao carregar insumos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const canSave = useMemo(() => {
    const q = Number(stockQuantity);
    return code.trim() && name.trim() && !Number.isNaN(q) && q >= 0;
  }, [code, name, stockQuantity]);

  async function onCreate() {
    if (!canSave) return;

    try {
      setBusy(true);
      setError("");

      // ✅ o backend exige stock_quantity
      await createRawMaterial({
        code: code.trim(),
        name: name.trim(),
        stock_quantity: Number(stockQuantity),
      });

      setCode("");
      setName("");
      setStockQuantity("");
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao criar insumo.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id) {
    const ok = window.confirm("Deseja excluir este insumo?");
    if (!ok) return;

    try {
      setBusy(true);
      setError("");
      await deleteRawMaterial(id);
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao excluir insumo.");
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
              Insumos
            </h1>
            <p className="text-slate-500 mt-1">
              Cadastre matérias-primas com código e estoque atual.
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
            <h2 className="font-bold text-slate-900">Novo insumo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Código (ex: RM001)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Nome do material (ex: Madeira)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Quantidade em estoque (ex: 120)"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
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
            <Droplets className="text-slate-500" size={18} />
            <h2 className="font-bold text-slate-900">Lista de insumos</h2>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">Carregando...</div>
          ) : items.length ? (
            <div className="divide-y divide-slate-100">
              {items.map((rm) => (
                <div
                  key={rm.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">{rm.name}</p>
                    <p className="text-sm text-slate-500">
                      {rm.code} • Estoque:{" "}
                      <span className="font-bold text-slate-700">
                        {Number(rm.stock_quantity ?? 0)}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(rm.id)}
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
              Nenhum insumo cadastrado ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
