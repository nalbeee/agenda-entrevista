const Usuario = require('./Usuario');
const Postulante = require('./Postulante');
const Entrevista = require('./Entrevista');
const HistorialEntrevista = require('./HistorialEntrevista');

// 1. Relación: Usuario (Entrevistador) -> Entrevistas (1 a muchos)
Usuario.hasMany(Entrevista, { foreignKey: 'entrevistadorId', as: 'entrevistasAsignadas' });
Entrevista.belongsTo(Usuario, { foreignKey: 'entrevistadorId', as: 'entrevistador' });

// 2. Relación: Postulante -> Entrevistas (1 a muchos)
Postulante.hasMany(Entrevista, { foreignKey: 'postulanteId', as: 'entrevistas' });
Entrevista.belongsTo(Postulante, { foreignKey: 'postulanteId', as: 'postulante' });

// 3. Relación: Entrevista -> Historial (1 a muchos)
Entrevista.hasMany(HistorialEntrevista, { foreignKey: 'entrevistaId', as: 'historial' });
HistorialEntrevista.belongsTo(Entrevista, { foreignKey: 'entrevistaId', as: 'entrevistaOrigen' });

module.exports = {
    Usuario,
    Postulante,
    Entrevista,
    HistorialEntrevista
};