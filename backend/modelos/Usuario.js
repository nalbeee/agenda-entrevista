const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false, // Obligatorio
        validate: {
            notEmpty: { msg: "El nombre no puede estar vacío" }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Este email ya está registrado" },
        validate: {
            isEmail: { msg: "Debe ser un formato de email válido" }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
        // Nota: Aquí guardaremos la contraseña encriptada (hasheada) más adelante usando bcryptjs
    },
    rol: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'entrevistador', 
        validate: {
            isIn: {
                args: [['admin', 'entrevistador']],
                msg: "El rol debe ser 'admin' o 'entrevistador'"
            }
        }
    }
}, {
    tableName: 'usuarios', // Forzamos el nombre de la tabla en plural
    timestamps: false      // Evita que Sequelize cree las columnas createdAt y updatedAt automáticamente (puedes ponerlo en true si las necesitas)
});

module.exports = Usuario;