import { lazy } from "react";

const Accueil = lazy(() => import("./pages/Accueil"));
const Contact = lazy(() => import("./pages/Contact"));

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Chargement…</div>}>
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
