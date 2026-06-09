const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Importamos el modelo y el middleware de validación
const { Postulante } = require('../modelos/asociaciones');
const { validarCampos } = require('../middleware/validator');

/**
 * 1. GET /api/postulantes
 * PROPÓSITO: Obtener la lista de todos los postulantes registrados.
 */
router.get('/', async (req, res) => {
    try {
        const postulantes = await Postulante.findAll({
            // Los ordenamos alfabéticamente por apellido para que sea fácil leerlos
            order: [['apellidos', 'ASC']]
        });
        
        res.status(200).json(postulantes);
    } catch (error) {
        console.error('Error en GET /api/postulantes:', error);
        res.status(500).json({ error: 'Hubo un error al obtener los postulantes.' });
    }
});

/**
 * 2. POST /api/postulantes
 * PROPÓSITO: Registrar un nuevo candidato en el sistema.
 */
router.post('/', [
    // Reglas de validación para proteger nuestra base de datos
    body('nombres').notEmpty().withMessage('El nombre es obligatorio.'),
    body('apellidos').notEmpty().withMessage('El apellido es obligatorio.'),
    body('email')
        .notEmpty().withMessage('El email es obligatorio.')
        .isEmail().withMessage('Debe ser un formato de email válido.'),
    body('telefono').optional().isString(),
    validarCampos
], async (req, res) => {
    const { nombres, apellidos, email, telefono } = req.body;

    try {
        // Regla de negocio: No pueden existir dos postulantes con el mismo correo
        const postulanteExistente = await Postulante.findOne({ where: { email } });
        if (postulanteExistente) {
            return res.status(400).json({ error: 'Ya existe un postulante registrado con este correo electrónico.' });
        }

        // Creamos el postulante
        const nuevoPostulante = await Postulante.create({
            nombres,
            apellidos,
            email,
            telefono,
            estado: 'activo'
        });

        res.status(201).json(nuevoPostulante);

    } catch (error) {
        console.error('Error en POST /api/postulantes:', error);
        res.status(500).json({ error: 'Hubo un error al crear el postulante.' });
    }
});

module.exports = router;