const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const HistorialEntrevista = sequelize.define('HistorialEntrevista', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fechaCambio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Por defecto guarda el instante exacto del cambio
    },
    estadoAnterior: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser nulo si es el primer registro al crear la entrevista
    },
    estadoNuevo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detalle: {
        type: DataTypes.STRING,
        allowNull: true // Ejemplo: "El postulante pidió cambiar el horario por motivos de salud"
    }
}, {
    tableName: 'historial_entrevistas',
    timestamps: false
});

module.exports = HistorialEntrevista;