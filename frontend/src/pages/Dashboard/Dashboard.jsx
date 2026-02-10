// src/pages/Dashboard/Dashboard.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp, Package, RefreshCw } from "lucide-react";
import { getProductionSuggestions } from "../../services/api";

export default function Dashboard() {
  const [data, setData] = useState({
    products: [],
    total_production_value: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const res = await getProductionSuggestions();

      setData({
        products: Array.isArray(res?.products) ? res.products : [],
        total_production_value: Number(res?.total_production_value || 0),
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao buscar sugestões.");
      setData({ products: [], total_production_value: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = useMemo(() => {
    return Number(data.total_production_value || 0).toFixed(2);
  }, [data.total_production_value]);

  const hasProducts = data.products && data.products.length > 0;

  return (
    <div className="p-10">
      <div className="max-w-6xl">
        {/* HEADER */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Sugestão de Produção
            </h1>
            <p className="text-slate-500 mt-1">
              Análise em tempo real baseada nos insumos disponíveis.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-[0.99] flex items-center gap-2"
          >
            <RefreshCw size={18} />
            {loading ? "Atualizando..." : "Recarregar"}
          </button>
        </header>

        {/* ERRO */}
        {error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 mb-6">
            <p className="font-bold">Ops!</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : null}

        {/* CARD TOTAL */}
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-800">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700/80">
                Valor total estimado
              </p>
              <p className="text-2xl font-black text-emerald-900">R$ {total}</p>
            </div>
          </div>
        </div>

        {/* LISTA / GRID */}
        <section>
          {loading ? (
            <p className="text-slate-500">Carregando sugestões...</p>
          ) : hasProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.products.map((p) => (
                <SuggestionCard key={p.product_id} p={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-600">
              Nenhuma sugestão ainda. Cadastre produtos/insumos e crie receitas
              (BOM).
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SuggestionCard({ p }) {
  const unitValue = Number(p.unit_value || 0).toFixed(2);
  const totalValue = Number(p.total_value || 0).toFixed(2);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{p.product_name}</h3>
          <p className="text-sm text-slate-400">{p.product_code}</p>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl">
          <Package className="text-slate-300" size={26} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Pode produzir:</span>
          <span className="font-black text-blue-600">
            {p.quantity_possible} <span className="font-bold">un</span>
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Valor unitário:</span>
          <span className="font-bold text-slate-800">R$ {unitValue}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total:</span>
          <span className="font-bold text-slate-800">R$ {totalValue}</span>
        </div>
      </div>
    </div>
  );
}
