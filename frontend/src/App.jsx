import { Routes, Route, Navigate } from "react-router-dom";

import { Menu } from "./components/layout/Menu";
import { Footer } from "./components/layout/Footer";

import { Inicio } from "./pages/Inicio";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { NotFound } from "./pages/NotFound";
import { ResumenAdmin } from "./pages/ResumenAdmin";

import { Entrevistas } from "./pages/entrevistas/Entrevistas";
import { EntrevistaDetalle } from "./pages/entrevistas/EntrevistaDetalle";
import { EntrevistaFormulario } from "./pages/entrevistas/EntrevistaFormulario";

function App() {
  return (
    <>
      <Menu />

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" />} />
          <Route path="/inicio" element={<Inicio />} />

          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          <Route path="/entrevistas" element={<Entrevistas />} />
          <Route path="/entrevistas/nueva" element={<EntrevistaFormulario modo="alta" />} />
          <Route path="/entrevistas/:id" element={<EntrevistaDetalle />} />
          <Route path="/entrevistas/:id/editar" element={<EntrevistaFormulario modo="edicion" />} />
          <Route path="/entrevistas/:id/reprogramar" element={<EntrevistaFormulario modo="reprogramacion" />} />

          <Route path="/resumen" element={<ResumenAdmin />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;


