// src/layouts/AppLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar pathname={location.pathname} />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
