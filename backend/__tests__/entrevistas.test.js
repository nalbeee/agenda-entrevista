const request = require('supertest');
const app = require('../index'); // Importamos nuestro servidor

describe('Pruebas del Módulo de Entrevistas', () => {
    let token = '';

    // 1. ANTES DE LAS PRUEBAS: Iniciamos sesión para conseguir la llave
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@agenda.com',
                password: '123456'
            });
        
        // Guardamos el token en nuestra variable global para usarlo en los tests
        token = res.body.token; 
    });

    // 2. PRUEBA DE SEGURIDAD
    it('Debería denegar el acceso (Status 401) si se intenta acceder sin token', async () => {
        const response = await request(app).get('/api/entrevistas');
        
        expect(response.statusCode).toEqual(401);
        expect(response.body.error).toBe('Acceso denegado. No se proporcionó un token de seguridad.');
    });

    // 3. PRUEBA DE LECTURA (GET)
    it('Debería listar las entrevistas correctamente al enviar el token (Status 200)', async () => {
        const response = await request(app)
            .get('/api/entrevistas')
            .set('Authorization', `Bearer ${token}`); // Simulamos la pestaña "Auth" de Postman
        
        expect(response.statusCode).toEqual(200);
        expect(Array.isArray(response.body)).toBeTruthy(); // Verificamos que devuelva un arreglo []
    });

    // Generamos una fecha dinámica en el futuro sumando milisegundos para que NUNCA choque con tests anteriores
    const fechaPrueba = new Date(Date.now() + 86400000).toISOString();

    // 4. PRUEBA DE ESCRITURA (POST) - CAMINO FELIZ
    it('Debería agendar una nueva entrevista correctamente (Status 201)', async () => {
        const response = await request(app)
            .post('/api/entrevistas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fechaHora: fechaPrueba,
                modalidad: 'virtual',
                entrevistadorId: 1, // Usamos los IDs que sabemos que los seeders crearon
                postulanteId: 1,
                notas: 'Prueba automatizada con Jest'
            });
        
        expect(response.statusCode).toEqual(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.estado).toBe('programada');
    });

    // 5. PRUEBA DE REGLA DE NEGOCIO - SUPERPOSICIÓN
    it('Debería bloquear la creación si el horario se superpone (Status 400)', async () => {
        const response = await request(app)
            .post('/api/entrevistas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                fechaHora: fechaPrueba, // ¡Misma fecha y hora que la prueba anterior!
                modalidad: 'presencial',
                entrevistadorId: 1,     // ¡Mismo entrevistador!
                postulanteId: 2
            });
        
        expect(response.statusCode).toEqual(400);
        expect(response.body.error).toBe('El entrevistador ya tiene una entrevista asignada en ese horario exacto.');
    });
});