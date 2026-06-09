const { DataTypes } = require('sequelize');
const sequelize = require('../db.js');

const Entrevista = sequelize.define('Entrevista', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fechaHora: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isDate: { msg: "Debe ser una fecha y hora válida" }
        }
    },
    modalidad: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['virtual', 'presencial']],
                msg: "La modalidad debe ser 'virtual' o 'presencial'"
            }
        }
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'programada',
        validate: {
            isIn: {
                args: [['programada', 'realizada', 'cancelada', 'reprogramada']],
                msg: "Estado inválido"
            }
        }
    },
    notas: {
        type: DataTypes.STRING,
        allowNull: true // El entrevistador puede dejar este campo vacío si no tiene observaciones
    }
}, {
    tableName: 'entrevistas',
    timestamps: false
});

module.exports = Entrevista;