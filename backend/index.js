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

// Conectamos el módulo de autenticación
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Conectamos el módulo de postulantes
const postulantesRoutes = require('./routes/postulantes.routes');
app.use('/api/postulantes', postulantesRoutes);
// ------------------------------------

// 5. Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Backend de la Agenda de Entrevistas funcionando correctamente! Puto el que lo lea');
});

// ¡IMPORTANTE! Importamos los modelos con sus relaciones ya configuradas
require('./modelos/asociaciones');

// 🔍 UBICACIÓN EXACTA: MIDDLEWARE GLOBAL DE MANEJO DE ERRORES
// Atrapa cualquier fallo no controlado para que el servidor no haga crash.
app.use((err, req, res, next) => {
    // Limpieza de consola: Solo mostramos el error feo si NO estamos haciendo pruebas automatizadas
    if (process.env.NODE_ENV !== 'test') {
        console.error('🚨 Error crítico interceptado por el servidor:');
        console.error(err.stack);
    }

    // Le respondemos al frontend educadamente para que no se quede cargando infinitamente
    res.status(500).json({ 
        error: 'Ocurrió un error interno inesperado en el servidor. Por favor, intente nuevamente más tarde.' 
    });
});

// 6. Sincronizar Base de Datos y Levantar el Servidor
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        // Silenciamos este log durante los tests para que Jest no tire advertencias
        if (process.env.NODE_ENV !== 'test') {
            console.log('✅ Conexión a SQLite establecida.');
        }
        
        // .sync({ force: false }) crea las tablas si no existen. 
        // Si pusieras { force: true }, borraría todo y crearía las tablas de cero cada vez que reinicias (útil en desarrollo).
        return sequelize.sync({ force: false }); 
    })
    .then(() => {
        // Agrupamos el log y el arranque del servidor para que solo corran en modo normal
        if (process.env.NODE_ENV !== 'test') {
            console.log('✅ Tablas sincronizadas con éxito.');
            app.listen(PORT, () => {
                console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            });
        }
    })
    .catch((error) => {
        console.error('❌ Error al conectar o sincronizar con la base de datos:', error);
    });

// Exportamos la app para que Supertest pueda consumirla en las pruebas
module.exports = app;