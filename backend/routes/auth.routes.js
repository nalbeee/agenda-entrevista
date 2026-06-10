/**
 * @file auth.routes.js
 * @description Rutas para el manejo de autenticación de usuarios y generación de tokens JWT.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');

// Importamos el modelo Usuario y nuestro middleware de validación
const { Usuario } = require('../modelos/asociaciones');
const { validarCampos } = require('../middleware/validator');

/**
 * @route POST /api/auth/login
 * @description Autentica a un usuario validando sus credenciales y devuelve un token JWT.
 * El token generado cumple con la regla de no incluir información sensible como la contraseña.
 * @access Público
 * @param {Object} req.body - Cuerpo de la petición.
 * @param {string} req.body.email - Correo electrónico del usuario.
 * @param {string} req.body.password - Contraseña en texto plano.
 * @returns {Object} 200 - Objeto con el mensaje de éxito, el token JWT y los datos básicos del usuario.
 * @returns {Object} 400 - Error de validación de los datos de entrada (express-validator).
 * @returns {Object} 401 - Error de credenciales inválidas (email o contraseña incorrectos).
 * @returns {Object} 500 - Error interno del servidor.
 */
router.post('/login', [
    // Validamos que nos envíen los datos con el formato correcto
    body('email').isEmail().withMessage('Debe ingresar un email válido.'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.'),
    validarCampos // Middleware que intercepta y devuelve errores 400 si fallan las validaciones previas
], async (req, res) => {
    const { email, password } = req.body;

    try {
        // PASO 1: Buscar si el usuario existe en la base de datos por su email
        const usuario = await Usuario.findOne({ where: { email } });
        
        if (!usuario) {
            // Regla de seguridad: Nunca dar pistas exactas de si falló el email o la clave para evitar ataques de enumeración.
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // PASO 2: Comparar la contraseña enviada en texto plano con el hash guardado en la base de datos
        const passwordValida = await bcrypt.compare(password, usuario.password);
        
        if (!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // PASO 3: Generar el Token JWT
        // En el "payload" (la carga útil) guardamos datos identificatorios para el frontend, NUNCA contraseñas
        const payload = {
            id: usuario.id,
            rol: usuario.rol
        };

        // Firmamos el token con la clave secreta de nuestro archivo .env
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '2h' // El token expirará por seguridad en 2 horas, forzando un nuevo login
        });

        // PASO 4: Responder al frontend con éxito
        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            token: token, // Este es el string codificado que el frontend deberá guardar (ej. en contexto o sessionStorage)
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error('Error en POST /api/auth/login:', error);
        res.status(500).json({ error: 'Ocurrió un error interno durante la autenticación.' });
    }
});

module.exports = router;