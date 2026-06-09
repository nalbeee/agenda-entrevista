const { Sequelize } = require('sequelize');

// Inicializamos la conexión indicando que usaremos SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    // La ruta donde se creará el archivo físico de la base de datos
    storage: './.data/agenda.db', 
    // Ponemos logging en 'false' para que la consola no se llene de comandos SQL cada vez que hagamos una consulta
    logging: false 
});

module.exports = sequelize;