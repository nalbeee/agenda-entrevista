/**
 * @file entrevistas.test.js
 * @description Suite de pruebas automatizadas para el módulo de Entrevistas.
 * Verifica la protección de rutas mediante JWT, las operaciones CRUD (lectura y escritura)
 * y el cumplimiento estricto de las reglas de negocio (como evitar superposición de horarios).
 */

const request = require('supertest');
const app = require('../index'); // Importamos la instancia de nuestro servidor Express

/**
 * @testsuite Pruebas del Módulo de Entrevistas
 * @description Engloba todas las pruebas relacionadas con la agenda de citas.
 */
describe('Pruebas del Módulo de Entrevistas', () => {
    let token = '';

    /**
     * @setup Hook beforeAll
     * @description Antes de correr cualquier prueba de este bloque, simulamos un inicio
     * de sesión exitoso para obtener un Token JWT. Este token se guardará en memoria
     * para inyectarlo en las peticiones posteriores y simular a un usuario autenticado.
     */
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@agenda.com',
                password: '123456'
            });
        
        token = res.body.token; 
    });

    /**
     * @test Seguridad: Bloqueo por falta de Token
     * @description Verifica que el middleware `verificarToken` rechace peticiones 
     * a rutas protegidas si no se incluye el encabezado de autorización.
     */
    it('Debería denegar el acceso (Status 401) si se intenta acceder sin token', async () => {
        const response = await request(app).get('/api/entrevistas');
        
        expect(response.statusCode).toEqual(401);
        expect(response.body.error).toBe('Acceso denegado. No se proporcionó un token de seguridad.');
    });

    /**
     * @test Lectura: Listado exitoso
     * @description Comprueba que un usuario autenticado pueda recuperar el arreglo
     * completo de entrevistas programadas.
     */
    it('Debería listar las entrevistas correctamente al enviar el token (Status 200)', async () => {
        const response = await request(app)
            .get('/api/entrevistas')
            .set('Authorization', `Bearer ${token}`); // Inyectamos el token en los headers
        
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

    // Generamos una fecha dinámica en el futuro sumando 24 horas (86400000 milisegundos)
    // Esto garantiza que el bot de pruebas NUNCA choque con registros de ejecuciones anteriores.
    const fechaPrueba = new Date(Date.now() + 86400000).toISOString();

    /**
     * @test Escritura: Creación exitosa (Camino Feliz)
     * @description Simula el alta de una nueva entrevista con datos válidos y verifica
     * que el servidor responda con un HTTP 201 (Created) y el estado por defecto.
     */
    it('Debería agendar una nueva entrevista correctamente (Status 201)', async () => {
        const response = await request(app)
            .post('/api/entrevistas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fechaHora: fechaPrueba,
                modalidad: 'virtual',
                entrevistadorId: 2, // ID de un entrevistador generado en el seeder
                postulanteId: 1,    // ID de un postulante generado en el seeder
                notas: 'Prueba automatizada con Jest'
            });
        
        expect(response.statusCode).toEqual(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.estado).toBe('programada');
    });

    /**
     * @test Regla de Negocio: Superposición de Horarios
     * @description Intenta crear una segunda entrevista para el MISMO entrevistador
     * en la MISMA fecha y hora exacta que la prueba anterior. Verifica que el sistema 
     * atrape el conflicto y responda con un HTTP 400 (Bad Request).
     */
    it('Debería bloquear la creación si el horario se superpone (Status 400)', async () => {
        const response = await request(app)
            .post('/api/entrevistas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fechaHora: fechaPrueba, // ¡Misma fecha y hora que la cita recién creada!
                modalidad: 'presencial',
                entrevistadorId: 2,     // ¡Mismo entrevistador!
                postulanteId: 2         // Distinto postulante
            });
        
        expect(response.statusCode).toEqual(400);
        expect(response.body.error).toBe('El entrevistador ya tiene una entrevista asignada en ese horario exacto.');
    });
});