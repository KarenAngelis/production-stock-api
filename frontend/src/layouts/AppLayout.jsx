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
        {process.env.REACT_APP_DEMO_MODE === "true" && (
          <div className="bg-blue-50 border-b border-blue-200 p-4 text-sm text-blue-950 flex flex-wrap gap-3 justify-between">
            <span>Portfolio demo · Fictional data saved only in this browser tab. No live company data.</span>
            <button className="font-bold underline" onClick={() => { sessionStorage.removeItem("stockmaster-demo-v1"); window.location.reload(); }}>Reset demo</button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
