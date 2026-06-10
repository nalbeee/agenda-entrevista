/**
 * @file index.js
 * @description Punto de entrada principal del servidor backend de la Agenda de Entrevistas.
 * Se encarga de inicializar Express, configurar middlewares globales, montar el enrutador,
 * gestionar el manejo de errores y establecer la conexión con la base de datos SQLite.
 */

// 1. Cargar variables de entorno
require('dotenv').config();

// 2. Importar las librerías necesarias
const express = require('express');
const cors = require('cors');

// Importamos nuestra configuración centralizada de la base de datos (Sequelize)
const sequelize = require('./db.js'); 

// 3. Inicializar la aplicación Express
const app = express();

// 4. Configurar Middlewares globales
app.use(cors()); // Permite peticiones cruzadas (frontend <-> backend)
app.use(express.json()); // Permite al servidor interpretar cuerpos de peticiones en formato JSON

// --- RUTAS DEL SISTEMA ---

/**
 * Módulo de Entrevistas
 * Prefijo: /api/entrevistas
 */
const entrevistasRoutes = require('./routes/entrevistas.routes');
app.use('/api/entrevistas', entrevistasRoutes);

/**
 * Módulo de Autenticación
 * Prefijo: /api/auth
 */
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

/**
 * Módulo de Postulantes
 * Prefijo: /api/postulantes
 */
const postulantesRoutes = require('./routes/postulantes.routes');
app.use('/api/postulantes', postulantesRoutes);

// ------------------------------------

/**
 * 5. Ruta de prueba (Healthcheck)
 * @route GET /
 * @description Verifica que el servidor esté levantado y respondiendo peticiones.
 */
app.get('/', (req, res) => {
    res.send('¡Backend de la Agenda de Entrevistas funcionando correctamente! Puto el que lo lea');
});

// Importamos los modelos para inicializar las asociaciones y claves foráneas en la base de datos
require('./modelos/asociaciones');

/**
 * 6. Middleware Global de Manejo de Errores
 * @description Intercepta cualquier fallo no controlado en los controladores o middlewares previos.
 * Evita que el servidor se caiga (crash) y devuelve una respuesta estructurada al cliente.
 */
app.use((err, req, res, next) => {
    // Limpieza de consola: Evitamos saturar la terminal durante la ejecución de pruebas automatizadas (Jest)
    if (process.env.NODE_ENV !== 'test') {
        console.error('Error crítico interceptado por el servidor:');
        console.error(err.stack);
    }

    // Respuesta genérica HTTP 500 para el frontend
    res.status(500).json({ 
        error: 'Ocurrió un error interno inesperado en el servidor. Por favor, intente nuevamente más tarde.' 
    });
});

/**
 * 7. Sincronización de Base de Datos y Arranque del Servidor
 * @description Autentica la conexión con SQLite, sincroniza las tablas y levanta el servidor en el puerto indicado.
 */
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        // Silenciamos este log durante los tests para evitar advertencias de procesos asíncronos en Jest
        if (process.env.NODE_ENV !== 'test') {
            console.log('Conexión a SQLite establecida.');
        }
        
        // .sync({ force: false }) sincroniza los modelos con la base de datos creando tablas faltantes sin borrar datos.
        // Nota para desarrollo: Usar { force: true } para recrear la base de datos desde cero.
        return sequelize.sync({ force: false }); 
    })
    .then(() => {
        // Agrupamos el log de éxito y el inicio del servidor para que solo corran en entorno de desarrollo/producción
        if (process.env.NODE_ENV !== 'test') {
            console.log('Tablas sincronizadas con éxito.');
            app.listen(PORT, () => {
                console.log(`Servidor corriendo en http://localhost:${PORT}`);
            });
        }
    })
    .catch((error) => {
        console.error('Error al conectar o sincronizar con la base de datos:', error);
    });

// Exportamos la instancia de la aplicación para que pueda ser consumida por Supertest en las pruebas automatizadas
module.exports = app;