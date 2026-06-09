function EntrevistaFormulario({ modo }) {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        Formulario de entrevista
      </div>

      <div className="card-body">
        <p>Modo actual del formulario: {modo}</p>
      </div>
    </div>
  );
}

export { EntrevistaFormulario };