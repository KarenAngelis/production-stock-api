import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getProducts,
  getRawMaterials,
  getStockMovements,
  createStockMovement,
} from "../../services/api";
import { History, PlusCircle } from "lucide-react";

export default function StockMovements() {
  const [products, setProducts] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // form
  const [itemType, setItemType] = useState("raw_material"); // raw_material | product
  const [itemId, setItemId] = useState("");
  const [movementType, setMovementType] = useState("in"); // in | out
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [p, rm, movs] = await Promise.all([
        getProducts(),
        getRawMaterials(),
        getStockMovements(),
      ]);

      setProducts(Array.isArray(p) ? p : []);
      setRawMaterials(Array.isArray(rm) ? rm : []);
      setItems(Array.isArray(movs) ? movs : []);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao carregar movimentações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // opções do select "Item" depende do itemType
  const currentOptions = useMemo(() => {
    return itemType === "product" ? products : rawMaterials;
  }, [itemType, products, rawMaterials]);

  // se trocou o tipo (produto/insumo), limpa itemId pra evitar enviar id inválido
  useEffect(() => {
    setItemId("");
  }, [itemType]);

  const canSave = useMemo(() => {
    const q = Number(quantity);
    return (
      String(itemId).trim() &&
      (movementType === "in" || movementType === "out") &&
      !Number.isNaN(q) &&
      q > 0
    );
  }, [itemId, movementType, quantity]);

  const byProductId = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  const byRawId = useMemo(() => {
    const map = new Map();
    rawMaterials.forEach((rm) => map.set(rm.id, rm));
    return map;
  }, [rawMaterials]);

  async function onCreate() {
    if (!canSave) return;

    try {
      setBusy(true);
      setError("");

      const payload = {
        item_type: itemType, // "raw_material" | "product"
        item_id: Number(itemId),
        movement_type: movementType, // "in" | "out"
        quantity: Number(quantity),
        reason: (reason || "").trim() || "movimento manual",
      };

      await createStockMovement(payload);

      setItemId("");
      setQuantity("");
      setReason("");
      await load();
    } catch (e) {
      console.error(e);
      setError(e?.message || "Erro ao criar movimentação.");
    } finally {
      setBusy(false);
    }
  }

  function formatMovementLabel(x) {
    return x === "in" ? "Entrada" : "Saída";
  }

  function formatItemLabel(mov) {
    const id = mov.item_id;
    if (mov.item_type === "product") {
      const p = byProductId.get(id);
      return p ? `${p.code} — ${p.name}` : `Produto #${id}`;
    }
    const rm = byRawId.get(id);
    return rm ? `${rm.code} — ${rm.name}` : `Insumo #${id}`;
  }

  return (
    <div className="p-10">
      <div className="max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Movimentações
            </h1>
            <p className="text-slate-500 mt-1">
              Registre entradas e saídas para atualizar o estoque real.
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
            <h2 className="font-bold text-slate-900">Nova movimentação</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* tipo do movimento */}
            <select
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              value={movementType}
              onChange={(e) => setMovementType(e.target.value)}
            >
              <option value="in">Entrada (in)</option>
              <option value="out">Saída (out)</option>
            </select>

            {/* tipo do item */}
            <select
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
            >
              <option value="raw_material">Insumo</option>
              <option value="product">Produto</option>
            </select>

            {/* item */}
            <select
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              <option value="">
                {itemType === "product"
                  ? "Selecione o produto"
                  : "Selecione o insumo"}
              </option>
              {currentOptions.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.code} — {x.name}
                </option>
              ))}
            </select>

            {/* quantidade */}
            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Quantidade (ex: 10)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="grid grid-cols-1 mt-4">
            <input
              className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Motivo (opcional) — ex: compra, ajuste, perda..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
            <History className="text-slate-500" size={18} />
            <h2 className="font-bold text-slate-900">Histórico</h2>
          </div>

          {loading ? (
            <div className="p-6 text-slate-500">Carregando...</div>
          ) : items.length ? (
            <div className="divide-y divide-slate-100">
              {items.map((mov) => (
                <div
                  key={mov.id}
                  className="px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {formatMovementLabel(mov.movement_type)} •{" "}
                      {formatItemLabel(mov)}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Quantidade:{" "}
                      <span className="font-bold text-slate-700">
                        {Number(mov.quantity ?? 0)}
                      </span>
                      {mov.reason ? ` • Motivo: ${mov.reason}` : ""}
                    </p>
                  </div>

                  {/* Sem botão excluir (como requisito) */}
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      mov.movement_type === "in"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {mov.movement_type === "in" ? "IN" : "OUT"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-slate-600">
              Nenhuma movimentação registrada ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
