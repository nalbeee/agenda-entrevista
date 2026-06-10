/**
 * @file Entrevista.js
 * @description Definición del modelo Sequelize para la entidad Entrevista.
 * Representa una cita programada dentro del proceso de selección de personal.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

/**
 * @class Entrevista
 * @description Modelo que mapea la tabla 'entrevistas' en la base de datos.
 * Define la estructura, tipos de datos y validaciones a nivel de base de datos para cada entrevista.
 * Nota: Las claves foráneas (postulanteId y entrevistadorId) se inyectan automáticamente
 * a través del archivo asociaciones.js para mantener los modelos desacoplados.
 */
const Entrevista = sequelize.define('Entrevista', {
    /**
     * @property {number} id - Identificador único y autoincremental de la entrevista.
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    /**
     * @property {Date} fechaHora - Fecha y hora exacta en la que se llevará a cabo la entrevista.
     */
    fechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            // Sequelize verifica a nivel interno que el string ingresado pueda convertirse a una fecha real
            isDate: { msg: "Debe ser una fecha y hora válida" }
        }
    },
    
    /**
     * @property {string} modalidad - Forma en la que se realizará el encuentro.
     */
    modalidad: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            // Restricción de dominio: Solo permite valores específicos dictados por el negocio
            isIn: {
                args: [['virtual', 'presencial']],
                msg: "La modalidad debe ser 'virtual' o 'presencial'"
            }
        }
    },
    
    /**
     * @property {string} estado - Situación actual de la entrevista en el flujo del sistema.
     */
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'programada', // Al nacer, toda entrevista inicia como programada
        validate: {
            // Restricción de ciclo de vida de la entrevista
            isIn: {
                args: [['programada', 'realizada', 'cancelada', 'reprogramada']],
                msg: "Estado inválido"
            }
        }
    },
    
    /**
     * @property {string} notas - Espacio para comentarios del entrevistador o de RRHH.
     */
    notas: {
        type: DataTypes.STRING,
        allowNull: true // El entrevistador puede dejar este campo vacío si no tiene observaciones al crearla
    }
}, {
    // Configuraciones adicionales del modelo
    tableName: 'entrevistas', // Forzamos el nombre en plural para la tabla en SQLite
    timestamps: false // Desactivamos createdAt y updatedAt automáticos ya que usamos el Historial para auditar
});

module.exports = Entrevista;