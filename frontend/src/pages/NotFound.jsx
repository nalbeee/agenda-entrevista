import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="alert alert-warning">
      <h1 className="h4">Página no encontrada</h1>
      <p>La ruta solicitada no existe.</p>

      <Link to="/inicio" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}

export { NotFound };