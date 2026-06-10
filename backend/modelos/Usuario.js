/**
 * @file Usuarios.js
 * @description Definición del modelo Sequelize para la entidad Usuario.
 * Representa a los entrevistadores, personal de RRHH y administradores 
 * que intervienen en el proceso de selección y operan el sistema.
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

/**
 * @class Usuario
 * @description Modelo que mapea la tabla 'usuarios' en la base de datos.
 * Define la estructura de las credenciales de acceso, validaciones de email,
 * niveles de permisos (roles) y el estado de activación de la cuenta.
 */
const Usuario = sequelize.define('Usuario', {
    /**
     * @property {number} id - Identificador único y autoincremental del usuario.
     */
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    
    /**
     * @property {string} nombre - Nombre visible del usuario en el sistema.
     */
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "El nombre no puede estar vacío" }
        }
    },
    
    /**
     * @property {string} email - Credencial principal de acceso y dato de contacto.
     * Se exige formato válido y unicidad absoluta en la base de datos.
     */
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Este email ya está registrado" },
        validate: {
            isEmail: { msg: "Debe ser un formato de email válido" }
        }
    },
    
    /**
     * @property {string} password - Contraseña de autenticación encriptada (hash).
     */
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    /**
     * @property {string} rol - Define los permisos y el nivel de acceso dentro de la aplicación.
     */
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'entrevistador', 
        validate: {
            isIn: {
                args: [['admin', 'rrhh', 'entrevistador']],
                msg: "El rol debe ser 'admin', 'rrhh' o 'entrevistador'"
            }
        }
    },

    /**
     * @property {boolean} activo - Permite suspender o habilitar accesos al sistema sin borrar el registro.
     */
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'usuarios', // Forzamos el nombre de la tabla en plural para SQLite
    timestamps: false      // Evita que Sequelize cree las columnas createdAt y updatedAt automáticamente
});

module.exports = Usuario;