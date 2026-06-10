/**
 * @file seeders.js
 * @description Script de inicialización de la base de datos (Seeders).
 * Se encarga de borrar, recrear y poblar las tablas con datos de prueba iniciales 
 * (usuarios, postulantes, entrevistas e historial) para facilitar el desarrollo y testing.
 */

const bcrypt = require('bcryptjs');
const sequelize = require('../db.js');
const { Usuario, Postulante, Entrevista, HistorialEntrevista } = require('../modelos/asociaciones.js');

/**
 * @function cargarDatosSemilla
 * @description Ejecuta el proceso atómico de conexión, reseteo estructural e inserción 
 * masiva de registros (bulkCreate) para todas las entidades del dominio.
 * @async
 * @returns {Promise<void>} Termina el proceso de Node.js exitosamente (0) o con error (1).
 */
async function cargarDatosSemilla() {
    try {
        // 1. Conexión a la base de datos
        await sequelize.authenticate();
        console.log('Conectando a la base de datos para poblar datos...');

        // 2. Sincronización destructiva
        // force: true BORRA todas las tablas existentes y las vuelve a crear vacías. 
        // Ideal para resetear la base de datos a un estado limpio e inicial.
        await sequelize.sync({ force: true });
        console.log('Tablas recreadas desde cero.');

        // 3. Población de Usuarios (1 Admin y 3 Entrevistadores)
        // Se encripta una clave genérica ('123456') utilizando bcrypt para cumplir con las normas de seguridad
        const passwordHash = await bcrypt.hash('123456', 10);
        
        await Usuario.bulkCreate([
            { nombre: 'Admin General', email: 'admin@agenda.com', password: passwordHash, rol: 'admin' },
            { nombre: 'Juan Entrevistador', email: 'juan@agenda.com', password: passwordHash, rol: 'entrevistador' },
            { nombre: 'María RRHH', email: 'maria@agenda.com', password: passwordHash, rol: 'entrevistador' },
            { nombre: 'Carlos IT', email: 'carlos@agenda.com', password: passwordHash, rol: 'entrevistador' }
        ]);
        console.log('4 Usuarios creados (1 Admin, 3 Entrevistadores).');

        // 4. Población de Postulantes
        await Postulante.bulkCreate([
            { nombres: 'Lucas', apellidos: 'Gómez', email: 'lucas@mail.com', telefono: '11223344', puesto: 'Frontend Junior', estado: 'activo' },
            { nombres: 'Sofía', apellidos: 'Pérez', email: 'sofia@mail.com', telefono: '22334455', puesto: 'Backend Semi-Senior', estado: 'activo' },
            { nombres: 'Micaela', apellidos: 'Ruiz', email: 'mica@mail.com', telefono: '33445566', puesto: 'QA Tester', estado: 'activo' },
            { nombres: 'Pedro', apellidos: 'Sosa', email: 'pedro@mail.com', telefono: '44556677', puesto: 'DevOps Engineer', estado: 'activo' },
            { nombres: 'Ana', apellidos: 'Díaz', email: 'ana@mail.com', telefono: '55667788', puesto: 'UX/UI Designer', estado: 'activo' },
            { nombres: 'Diego', apellidos: 'López', email: 'diego@mail.com', telefono: '66778899', puesto: 'Project Manager', estado: 'activo' },
            { nombres: 'Laura', apellidos: 'García', email: 'laura@mail.com', telefono: '77889900', puesto: 'Frontend Senior', estado: 'activo' },
            { nombres: 'Martín', apellidos: 'Alonso', email: 'martin@mail.com', telefono: '88990011', puesto: 'Tech Lead', estado: 'activo' }
        ]);
        console.log('8 Postulantes creados.');

        // 5. Población de Entrevistas
        // Genera 12 entrevistas con fechas dinámicas y combinaciones de modalidades y usuarios
        const entrevistasData = [];
        for (let i = 1; i <= 12; i++) {
            entrevistasData.push({
                fechaHora: new Date(2026, 5, 10 + i, 10, 0, 0), // Fechas variadas en Junio 2026
                modalidad: i % 2 === 0 ? 'virtual' : 'presencial', // Distribución equitativa: virtual/presencial
                estado: 'programada',
                notas: `Entrevista inicial número ${i}`,
                entrevistadorId: (i % 3) + 2, // Asigna secuencialmente entrevistadores (IDs 2, 3 o 4)
                postulanteId: (i % 8) + 1     // Asigna secuencialmente postulantes (IDs del 1 al 8)
            });
        }
        
        const entrevistasCreadas = await Entrevista.bulkCreate(entrevistasData);
        console.log('12 Entrevistas creadas.');

        // 6. Generación del Historial de Auditoría
        // Crea un registro inicial en la tabla de historial para cada una de las 12 entrevistas creadas
        const historialesData = entrevistasCreadas.map(ent => ({
            fechaCambio: new Date(),
            estadoAnterior: null, // Null porque es la creación inicial
            estadoNuevo: 'programada',
            detalle: 'Creación inicial de la entrevista',
            entrevistaId: ent.id
        }));
        
        await HistorialEntrevista.bulkCreate(historialesData);
        console.log('12 Registros de historial creados.');

        console.log('¡Carga de datos semilla finalizada con éxito!');
        process.exit(0); // Termina la ejecución de Node.js indicando éxito

    } catch (error) {
        console.error('Error crítico al cargar los datos semilla:', error);
        process.exit(1); // Termina la ejecución indicando que ocurrió un fallo
    }
}

// Ejecutar la función principal de inicialización
cargarDatosSemilla();