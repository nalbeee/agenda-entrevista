const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verificarToken } = require('../middleware/auth');

// Importamos el modelo y el middleware de validación
const { Postulante } = require('../modelos/asociaciones');
const { validarCampos } = require('../middleware/validator');

/**
 * 1. GET /api/postulantes
 * PROPÓSITO: Obtener la lista de todos los postulantes registrados.
 */
router.get('/', verificarToken, async (req, res) => {
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
    verificarToken, // 🔒 Candado activado
    
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

/**
 * 3. PUT /api/postulantes/:id
 * PROPÓSITO: Modificar los datos de un postulante existente.
 */
router.put('/:id', [
    verificarToken, // 🔒 Candado activado
    
    // Todos los campos son opcionales porque capaz solo quieren cambiar el teléfono
    body('nombres').optional().notEmpty().withMessage('El nombre no puede estar vacío.'),
    body('apellidos').optional().notEmpty().withMessage('El apellido no puede estar vacío.'),
    body('email').optional().isEmail().withMessage('Debe ser un email válido.'),
    body('telefono').optional().isString(),
    validarCampos
], async (req, res) => {
    const { id } = req.params;
    const { nombres, apellidos, email, telefono } = req.body;

    try {
        // 1. Buscamos al postulante
        const postulante = await Postulante.findByPk(id);
        if (!postulante) {
            return res.status(404).json({ error: 'Postulante no encontrado.' });
        }

        // 2. Regla de negocio: Si están intentando cambiar el email, verificamos que no esté en uso
        if (email && email !== postulante.email) {
            const emailEnUso = await Postulante.findOne({ where: { email } });
            if (emailEnUso) {
                return res.status(400).json({ error: 'El nuevo email ingresado ya está siendo utilizado por otro candidato.' });
            }
        }

        // 3. Actualizamos los datos
        await postulante.update({
            nombres: nombres !== undefined ? nombres : postulante.nombres,
            apellidos: apellidos !== undefined ? apellidos : postulante.apellidos,
            email: email !== undefined ? email : postulante.email,
            telefono: telefono !== undefined ? telefono : postulante.telefono
        });

        res.status(200).json(postulante);

    } catch (error) {
        console.error('Error en PUT /api/postulantes/:id:', error);
        res.status(500).json({ error: 'Hubo un error interno al actualizar el postulante.' });
    }
});

/**
 * 4. DELETE /api/postulantes/:id
 * PROPÓSITO: Realizar una baja lógica del postulante para no romper el historial de entrevistas.
 */
router.delete('/:id', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const postulante = await Postulante.findByPk(id);
        if (!postulante) {
            return res.status(404).json({ error: 'Postulante no encontrado.' });
        }

        // Hacemos la BAJA LÓGICA
        await postulante.update({ estado: 'inactivo' });

        res.status(200).json({ 
            mensaje: 'Postulante dado de baja exitosamente.',
            postulante 
        });

    } catch (error) {
        console.error('Error en DELETE /api/postulantes/:id:', error);
        res.status(500).json({ error: 'Hubo un error al intentar dar de baja al postulante.' });
    }
});

module.exports = router;