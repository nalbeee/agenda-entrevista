/**
 * @file auth.test.js
 * @description Suite de pruebas automatizadas para el módulo de Autenticación.
 * Utiliza los frameworks Jest y Supertest para simular peticiones HTTP y 
 * validar el comportamiento del servidor sin necesidad de levantar el frontend.
 */

const request = require('supertest');
const app = require('../index'); // Importamos la instancia de nuestro servidor Express

/**
 * @testsuite Pruebas del Módulo de Autenticación (Login)
 * @description Verifica los distintos escenarios de inicio de sesión, garantizando que
 * el sistema entregue los tokens correctamente y bloquee intentos no autorizados.
 */
describe('Pruebas del Módulo de Autenticación (Login)', () => {
    
    /**
     * @test Camino Feliz: Login Exitoso
     * @description Simula el envío de credenciales válidas generadas en el seeder.
     * Verifica que el servidor responda con un HTTP 200 y entregue el token JWT.
     */
    it('Debería iniciar sesión correctamente y devolver un token (Status 200)', async () => {
        // Simulamos una petición POST a la ruta de login
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@agenda.com', // Usamos el usuario maestro creado en la semilla
                password: '123456'
            });

        // Afirmaciones (Expectativas) de lo que debería pasar:
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('token'); // Verificamos que exista la propiedad token
        expect(response.body.mensaje).toBe('Inicio de sesión exitoso');
    });

    /**
     * @test Manejo de Errores: Contraseña Incorrecta
     * @description Evalúa la seguridad del endpoint enviando una contraseña inválida.
     * Verifica que el sistema rechace el acceso con un HTTP 401 (Unauthorized).
     */
    it('Debería fallar si la contraseña es incorrecta (Status 401)', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@agenda.com',
                password: 'clave_equivocada_123' // Contraseña falsa inyectada a propósito
            });

        expect(response.statusCode).toEqual(401);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Credenciales inválidas.');
    });

    /**
     * @test Validación de Datos: Formato de Email Inválido
     * @description Comprueba que el middleware express-validator intercepte datos malformados
     * antes de que lleguen a la base de datos, retornando un HTTP 400 (Bad Request).
     */
    it('Debería fallar si el email no tiene formato válido (Status 400)', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin_sin_arroba_agenda.com', // Formato de email erróneo
                password: '123456'
            });

        expect(response.statusCode).toEqual(400); // El validador debe frenarlo y retornar error
    });
});