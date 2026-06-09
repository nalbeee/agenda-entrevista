import { Link } from "react-router-dom";

function Inicio() {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <i className="fa fa-users me-2"></i>
        Sistema de Agenda de Entrevistas
      </div>

      <div className="card-body">
        <h1 className="h3">Bienvenido</h1>

        <p>
          Esta aplicación permite coordinar entrevistas entre postulantes y
          entrevistadores, evitando superposiciones de horarios y respetando
          permisos por rol.
        </p>

        <div className="row g-3 mt-3">
          <div className="col-md-4">
            <div className="border rounded p-3 h-100">
              <h5>
                <i className="fa fa-calendar-days me-2 text-primary"></i>
                Entrevistas
              </h5>
              <p className="mb-0">
                Listado, filtros, detalle, alta, edición, cancelación,
                realización y reprogramación.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border rounded p-3 h-100">
              <h5>
                <i className="fa fa-user-shield me-2 text-primary"></i>
                Seguridad
              </h5>
              <p className="mb-0">
                Login, registro, JWT, roles y rutas protegidas.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="border rounded p-3 h-100">
              <h5>
                <i className="fa fa-chart-simple me-2 text-primary"></i>
                Resumen
              </h5>
              <p className="mb-0">
                Panel administrativo con métricas del dominio.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Link to="/entrevistas" className="btn btn-primary me-2">
            <i className="fa fa-search me-1"></i>
            Ver entrevistas
          </Link>

          <Link to="/entrevistas/nueva" className="btn btn-outline-primary">
            <i className="fa fa-plus me-1"></i>
            Nueva entrevista
          </Link>
        </div>
      </div>
    </div>
  );
}

export { Inicio };