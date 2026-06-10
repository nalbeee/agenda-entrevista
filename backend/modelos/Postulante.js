/**
 * @file Postulantes.js
 * @description Definición del modelo Sequelize para la entidad Postulante.
 * Representa a las personas candidatas que participan dentro del proceso de selección.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

/**
 * @class Postulante
 * @description Modelo que mapea la tabla 'postulantes' en la base de datos.
 * Define la estructura, tipos de datos y validaciones (como unicidad de email) 
 * de los datos personales y de contacto de cada candidato.
 */
const Postulante = sequelize.define('Postulante', {
    /**
     * @property {number} id - Identificador único y autoincremental del postulante.
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    /**
     * @property {string} nombres - Nombres de pila del candidato.
     */
    nombres: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    /**
     * @property {string} apellidos - Apellidos del candidato.
     */
    apellidos: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    /**
     * @property {string} email - Correo electrónico de contacto.
     * @description Se exige que tenga un formato de email válido y que sea único en todo el sistema.
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    
    /**
     * @property {string|null} telefono - Número de teléfono de contacto.
     */
    telefono: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser opcional dependiendo de la preferencia del candidato
    },

    /**
      * @property {string} puesto - Puesto o búsqueda a la que aplica.
      */
     puesto: {
         type: DataTypes.STRING,
         allowNull: false
     },

    /**
     * @property {string} estado - Estado actual del candidato en la plataforma.
     * @description Su valor por defecto es 'activo'. Es fundamental para gestionar las bajas lógicas (ej: pasarlo a 'inactivo') sin borrar registros históricos.
     */
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo' // Puede servir para bajas lógicas o saber si ya fue contratado
    }
}, {
    // Configuraciones adicionales del modelo
    tableName: 'postulantes',
    timestamps: false
});

module.exports = Postulante;