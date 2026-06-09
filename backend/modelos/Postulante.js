const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Postulante = sequelize.define('Postulante', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombres: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser opcional
    },
    estado: {
        type: DataTypes.STRING,
        defaultValue: 'activo' // Puede servir para bajas lógicas o saber si ya fue contratado
    }
}, {
    tableName: 'postulantes',
    timestamps: false
});

module.exports = Postulante;