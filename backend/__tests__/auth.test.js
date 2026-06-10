const request = require('supertest');
const app = require('../index'); // Importamos nuestro servidor

describe('Pruebas del Módulo de Autenticación (Login)', () => {
    
    it('Debería iniciar sesión correctamente y devolver un token (Status 200)', async () => {
        // Simulamos una petición POST a la ruta de login
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@agenda.com', // Usamos el usuario que creaste en el seeder
                password: '123456'
            });

        // Afirmaciones (Expectativas) de lo que debería pasar:
        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveProperty('token'); // Debe devolver un token
        expect(response.body.mensaje).toBe('Inicio de sesión exitoso');
    });

    it('Debería fallar si la contraseña es incorrecta (Status 401)', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@agenda.com',
                password: 'clave_equivocada_123' // Contraseña falsa
            });

        expect(response.statusCode).toEqual(401);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Credenciales inválidas.');
    });

    it('Debería fallar si el email no tiene formato válido (Status 400)', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin_sin_arroba_agenda.com',
                password: '123456'
            });

        expect(response.statusCode).toEqual(400); // El validador debe frenarlo
    });
});