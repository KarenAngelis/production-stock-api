// src/layouts/BlankLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function BlankLayout() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Outlet />
    </div>
  );
}
