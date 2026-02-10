// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import RawMaterials from "./pages/RawMaterials/RawMaterials";
import Recipes from "./pages/Recipes/Recipes";
import StockMovements from "./pages/StockMovements/StockMovements";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/produtos" element={<Products />} />
          <Route path="/insumos" element={<RawMaterials />} />
          <Route path="/receitas" element={<Recipes />} />
          <Route path="/movimentacoes" element={<StockMovements />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
