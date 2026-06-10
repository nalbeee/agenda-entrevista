/**
 * @file HistorialEntrevista.js
 * @description Definición del modelo Sequelize para la entidad HistorialEntrevista.
 * Funciona como una tabla de auditoría para registrar cada cambio de estado,
 * reprogramación o evento importante en el ciclo de vida de una entrevista.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

/**
 * @class HistorialEntrevista
 * @description Modelo que mapea la tabla 'historial_entrevistas' en la base de datos.
 * Permite mantener la trazabilidad de las modificaciones sobre las citas, indicando
 * cuándo ocurrió el cambio, qué estados se alteraron y el motivo (detalle).
 * Nota: La clave foránea que lo vincula con la entrevista (entrevistaId) se inyecta 
 * automáticamente desde el archivo asociaciones.js.
 */
const HistorialEntrevista = sequelize.define('HistorialEntrevista', {
    /**
     * @property {number} id - Identificador único y autoincremental del registro de auditoría.
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    /**
     * @property {Date} fechaCambio - Marca de tiempo exacta en la que se registró la modificación.
     */
    fechaCambio: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Por defecto guarda el instante exacto del cambio generado por el sistema
    },
    
    /**
     * @property {string|null} estadoAnterior - Estado de la entrevista previo a la modificación.
     */
    estadoAnterior: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser nulo si es el primer registro de auditoría (cuando nace la entrevista)
    },
    
    /**
     * @property {string} estadoNuevo - Nuevo estado asignado a la entrevista tras la operación.
     */
    estadoNuevo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    /**
     * @property {string|null} detalle - Justificación o motivo manual del cambio de estado o reprogramación.
     */
    detalle: {
        type: DataTypes.STRING,
        allowNull: true // Ejemplo: "El postulante pidió cambiar el horario por motivos de salud"
    }
}, {
    // Configuraciones adicionales del modelo
    tableName: 'historial_entrevistas',
    timestamps: false // Desactivamos los timestamps automáticos de Sequelize porque ya usamos 'fechaCambio'
});

module.exports = HistorialEntrevista;