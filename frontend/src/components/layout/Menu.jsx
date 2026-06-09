import { NavLink } from "react-router-dom";

function Menu() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <NavLink className="navbar-brand fw-semibold" to="/inicio">
          <i className="fa fa-calendar-check me-2"></i>
          Agenda Entrevistas
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContenido"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContenido">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/entrevistas">
                Entrevistas
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/resumen">
                Resumen
              </NavLink>
            </li>
          </ul>

          <div className="d-flex gap-2">
            <NavLink className="btn btn-outline-light btn-sm" to="/login">
              Login
            </NavLink>

            <NavLink className="btn btn-light btn-sm" to="/registro">
              Registro
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { Menu };