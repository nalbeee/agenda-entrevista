import { useParams } from "react-router-dom";

function EntrevistaDetalle() {
  const { id } = useParams();

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        Detalle de entrevista
      </div>

      <div className="card-body">
        <p>Mostrando detalle de la entrevista con id: {id}</p>
      </div>
    </div>
  );
}

export { EntrevistaDetalle };