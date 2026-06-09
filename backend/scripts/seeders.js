const bcrypt = require('bcryptjs');
const sequelize = require('../db.js');
const { Usuario, Postulante, Entrevista, HistorialEntrevista } = require('../modelos/asociaciones.js');

async function cargarDatosSemilla() {
    try {
        // Conectamos a la base de datos
        await sequelize.authenticate();
        console.log('⏳ Conectando a la base de datos para poblar datos...');

        // force: true BORRA todas las tablas y las vuelve a crear vacías. 
        // Ideal para resetear la base de datos a su estado inicial.
        await sequelize.sync({ force: true });
        console.log('✅ Tablas recreadas desde cero.');

        // 1. Crear Usuarios (1 Admin y 3 Entrevistadores)
        // Encriptamos la misma clave ('123456') para todos para facilitar las pruebas
        const passwordHash = await bcrypt.hash('123456', 10);
        
        await Usuario.bulkCreate([
            { nombre: 'Admin General', email: 'admin@agenda.com', password: passwordHash, rol: 'admin' },
            { nombre: 'Juan Entrevistador', email: 'juan@agenda.com', password: passwordHash, rol: 'entrevistador' },
            { nombre: 'María RRHH', email: 'maria@agenda.com', password: passwordHash, rol: 'entrevistador' },
            { nombre: 'Carlos IT', email: 'carlos@agenda.com', password: passwordHash, rol: 'entrevistador' }
        ]);
        console.log('✅ 4 Usuarios creados (1 Admin, 3 Entrevistadores).');

        // 2. Crear 8 Postulantes
        await Postulante.bulkCreate([
            { nombres: 'Lucas', apellidos: 'Gómez', email: 'lucas@mail.com', telefono: '11223344', estado: 'activo' },
            { nombres: 'Sofía', apellidos: 'Pérez', email: 'sofia@mail.com', telefono: '22334455', estado: 'activo' },
            { nombres: 'Micaela', apellidos: 'Ruiz', email: 'mica@mail.com', telefono: '33445566', estado: 'activo' },
            { nombres: 'Pedro', apellidos: 'Sosa', email: 'pedro@mail.com', telefono: '44556677', estado: 'activo' },
            { nombres: 'Ana', apellidos: 'Díaz', email: 'ana@mail.com', telefono: '55667788', estado: 'activo' },
            { nombres: 'Diego', apellidos: 'López', email: 'diego@mail.com', telefono: '66778899', estado: 'activo' },
            { nombres: 'Laura', apellidos: 'García', email: 'laura@mail.com', telefono: '77889900', estado: 'activo' },
            { nombres: 'Martín', apellidos: 'Alonso', email: 'martin@mail.com', telefono: '88990011', estado: 'activo' }
        ]);
        console.log('✅ 8 Postulantes creados.');

        // 3. Crear 12 Entrevistas (Asignando IDs del 2 al 4 para los entrevistadores)
        // Usamos fechas futuras y pasadas simuladas
        const entrevistasData = [];
        for (let i = 1; i <= 12; i++) {
            entrevistasData.push({
                fechaHora: new Date(2026, 5, 10 + i, 10, 0, 0), // Fechas variadas en Junio 2026
                modalidad: i % 2 === 0 ? 'virtual' : 'presencial', // Mitad virtual, mitad presencial
                estado: 'programada',
                notas: `Entrevista inicial número ${i}`,
                entrevistadorId: (i % 3) + 2, // Asigna entrevistadores ID 2, 3 o 4
                postulanteId: (i % 8) + 1     // Asigna postulantes del 1 al 8
            });
        }
        const entrevistasCreadas = await Entrevista.bulkCreate(entrevistasData);
        console.log('✅ 12 Entrevistas creadas.');

        // 4. Crear el Historial inicial para esas 12 entrevistas
        const historialesData = entrevistasCreadas.map(ent => ({
            fechaCambio: new Date(),
            estadoAnterior: null,
            estadoNuevo: 'programada',
            detalle: 'Creación inicial de la entrevista',
            entrevistaId: ent.id
        }));
        await HistorialEntrevista.bulkCreate(historialesData);
        console.log('✅ 12 Registros de historial creados.');

        console.log('🎉 ¡Carga de datos semilla finalizada con éxito!');
        process.exit(0); // Cierra el script automáticamente

    } catch (error) {
        console.error('❌ Error cargando los datos:', error);
        process.exit(1);
    }
}

// Ejecutar la función
cargarDatosSemilla();