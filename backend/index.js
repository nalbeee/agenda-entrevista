// 1. Cargar variables de entorno
require('dotenv').config();

// 2. Importar las librerías necesarias
const express = require('express');
const cors = require('cors');

// IMPORTANTE: Importamos nuestra configuración de base de datos
const sequelize = require('./db.js'); 

// 3. Inicializar la aplicación
const app = express();

// 4. Configurar Middlewares globales
app.use(cors()); 
app.use(express.json()); 

// --- NUEVO CÓDIGO: Conectar Rutas ---
const entrevistasRoutes = require('./routes/entrevistas.routes');
// Le decimos a Express: "Cualquier petición que empiece con /api/entrevistas, mandásela a este router"
app.use('/api/entrevistas', entrevistasRoutes);
// ------------------------------------

// 5. Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Backend de la Agenda de Entrevistas funcionando correctamente!');
});

// ¡IMPORTANTE! Importamos los modelos con sus relaciones ya configuradas
require('./modelos/asociaciones');

// 6. Sincronizar Base de Datos y Levantar el Servidor
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a SQLite establecida.');
        // .sync({ force: false }) crea las tablas si no existen. 
        // Si pusieras { force: true }, borraría todo y crearía las tablas de cero cada vez que reinicias (útil en desarrollo).
        return sequelize.sync({ force: false }); 
    })
    .then(() => {
        console.log('✅ Tablas sincronizadas con éxito.');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error al conectar o sincronizar con la base de datos:', error);
    });