// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Droplets,
  Receipt,
  History,
} from "lucide-react";

export default function Sidebar({ pathname = "/dashboard" }) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-xl text-white">
          <Package size={22} />
        </div>
        <span className="font-bold text-lg tracking-tight">StockMaster</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavItem
          to="/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />

        <NavItem
          to="/produtos"
          icon={<Package size={18} />}
          label="Produtos"
          active={pathname === "/produtos"}
        />

        <NavItem
          to="/insumos"
          icon={<Droplets size={18} />}
          label="Insumos"
          active={pathname === "/insumos"}
        />

        <NavItem
          to="/receitas"
          icon={<Receipt size={18} />}
          label="Receitas"
          active={pathname === "/receitas"}
        />

        <NavItem
          to="/movimentacoes"
          icon={<History size={18} />}
          label="Movimentações"
          active={pathname === "/movimentacoes"}
        />

      </nav>
    </aside>
  );
}

function NavItem({ to, icon, label, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
