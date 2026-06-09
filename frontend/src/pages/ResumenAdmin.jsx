function ResumenAdmin() {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        Resumen administrativo
      </div>

      <div className="card-body">
        <p>
          Acá se mostrarán entrevistas del día, entrevistas por entrevistador,
          postulantes en proceso y entrevistas canceladas.
        </p>
      </div>
    </div>
  );
}

export { ResumenAdmin };