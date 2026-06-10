/**
 * @file entrevistas.routes.js
 * @description Rutas principales del dominio de Entrevistas (ABMC).
 * Gestiona la programación, modificación y listado de citas, aplicando reglas de negocio
 * estrictas (como evitar superposiciones) y utilizando transacciones para mantener
 * un registro de auditoría automático.
 */

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { body } = require('express-validator');
const { validarCampos } = require('../middleware/validator');
const { verificarToken } = require('../middleware/auth');

// Importamos los modelos y la conexión a la base de datos
const { Entrevista, Postulante, Usuario, HistorialEntrevista } = require('../modelos/asociaciones');
const sequelize = require('../db');

/**
 * @route GET /api/entrevistas
 * @description Obtiene el listado completo de entrevistas ordenadas cronológicamente.
 * Utiliza JOINs de Sequelize (include) para adjuntar datos básicos del postulante y del entrevistador.
 * @access Privado (Requiere Token)
 * @returns {Array} 200 - Arreglo de objetos de entrevistas.
 * @returns {Object} 500 - Error interno del servidor.
 */
router.get('/', verificarToken, async (req, res) => {
    try {
        const entrevistas = await Entrevista.findAll({
            include: [
                {
                    model: Postulante,
                    as: 'postulante',
                    attributes: ['id', 'nombres', 'apellidos', 'email'] // Solo bajamos los datos necesarios para la UI
                },
                {
                    model: Usuario,
                    as: 'entrevistador',
                    attributes: ['id', 'nombre', 'email']
                }
            ],
            // Ordenamos de la cita más próxima a la más lejana en el tiempo
            order: [['fechaHora', 'ASC']]
        });

        res.status(200).json(entrevistas);
    } catch (error) {
        console.error('Error en GET /api/entrevistas:', error);
        res.status(500).json({ error: 'Hubo un error interno al intentar obtener las entrevistas.' });
    }
});

/**
 * @route POST /api/entrevistas
 * @description Crea una nueva entrevista. Valida previamente que el entrevistador no tenga
 * otra cita agendada en el mismo horario exacto. Toda la operación es transaccional.
 * @access Privado (Requiere Token)
 * @param {string} req.body.fechaHora - Fecha y hora de la cita (ISO 8601).
 * @param {string} req.body.modalidad - 'virtual' o 'presencial'.
 * @param {number} req.body.entrevistadorId - ID del usuario que entrevistará.
 * @param {number} req.body.postulanteId - ID del candidato.
 * @param {string} [req.body.notas] - Comentarios adicionales.
 * @returns {Object} 201 - Entrevista creada exitosamente.
 * @returns {Object} 400 - Error de validación o conflicto de superposición horaria.
 * @returns {Object} 500 - Error interno (Rollback ejecutado).
 */
router.post('/', [
    verificarToken,
    body('fechaHora').notEmpty().withMessage('La fecha y hora son obligatorias.').isISO8601().withMessage('Debe ser una fecha válida (formato ISO 8601).'),
    body('modalidad').notEmpty().withMessage('La modalidad es obligatoria.').isIn(['virtual', 'presencial']).withMessage('La modalidad debe ser "virtual" o "presencial".'),
    body('entrevistadorId').notEmpty().withMessage('El ID del entrevistador es obligatorio.').isInt({ min: 1 }).withMessage('El ID del entrevistador debe ser un número entero positivo.'),
    body('postulanteId').notEmpty().withMessage('El ID del postulante es obligatorio.').isInt({ min: 1 }).withMessage('El ID del postulante debe ser un número entero positivo.'),
    body('notas').optional().isString().withMessage('Las notas deben ser texto.').isLength({ max: 255 }).withMessage('Las notas no pueden superar los 255 caracteres.'),
    validarCampos
], async (req, res) => {
    
    const { fechaHora, modalidad, notas, entrevistadorId, postulanteId } = req.body;
    
    // Iniciamos una transacción para garantizar integridad: si falla el historial, no se guarda la entrevista
    const transaccion = await sequelize.transaction();

    try {
        // Regla de Negocio: Validar superposición exacta de horario para el entrevistador
        const entrevistaExistente = await Entrevista.findOne({
            where: {
                entrevistadorId: entrevistadorId,
                fechaHora: fechaHora,
                estado: { [Op.not]: 'cancelada' } // Ignoramos choques con citas previamente canceladas
            }
        });

        if (entrevistaExistente) {
            await transaccion.rollback();
            return res.status(400).json({ error: 'El entrevistador ya tiene una entrevista asignada en ese horario exacto.' });
        }

        // Paso 1: Crear la entidad Entrevista
        const nuevaEntrevista = await Entrevista.create({
            fechaHora,
            modalidad,
            notas,
            entrevistadorId,
            postulanteId,
            estado: 'programada'
        }, { transaction: transaccion });

        // Paso 2: Generar el registro de auditoría vinculado
        await HistorialEntrevista.create({
            estadoAnterior: null,
            estadoNuevo: 'programada',
            detalle: 'Alta inicial del registro de entrevista',
            entrevistaId: nuevaEntrevista.id
        }, { transaction: transaccion });

        // Confirmamos cambios en base de datos
        await transaccion.commit();
        res.status(201).json(nuevaEntrevista);

    } catch (error) {
        await transaccion.rollback(); // Revertimos operaciones parciales ante cualquier fallo
        console.error('Error en POST /api/entrevistas:', error);
        res.status(500).json({ error: 'Ocurrió un error interno al procesar el alta de la entrevista.' });
    }
});

/**
 * @route PUT /api/entrevistas/:id
 * @description Modifica una entrevista (reprogramación, cancelación, finalización) de 
 * forma transaccional, exigiendo que se adjunte un motivo para el historial.
 * @access Privado (Requiere Token)
 * @param {string} req.params.id - ID de la entrevista a actualizar.
 * @param {string} [req.body.estado] - Nuevo estado (programada, realizada, cancelada, reprogramada).
 * @param {string} [req.body.fechaHora] - Nueva fecha de cita.
 * @param {string} req.body.detalleHistorial - Motivo de la modificación (Obligatorio).
 * @returns {Object} 200 - Entrevista actualizada con éxito.
 * @returns {Object} 404 - Entrevista no encontrada.
 * @returns {Object} 500 - Error interno (Rollback ejecutado).
 */
router.put('/:id', [
    verificarToken,
    body('estado').optional().isIn(['programada', 'realizada', 'cancelada', 'reprogramada']).withMessage('Estado inválido.'),
    body('fechaHora').optional().isISO8601().withMessage('Debe ser una fecha válida.'),
    body('detalleHistorial').notEmpty().withMessage('Es obligatorio enviar un "detalleHistorial" explicando el motivo del cambio.'),
    validarCampos
], async (req, res) => {
    const { id } = req.params;
    const { fechaHora, modalidad, notas, estado, detalleHistorial } = req.body;

    const transaccion = await sequelize.transaction();

    try {
        const entrevista = await Entrevista.findByPk(id);

        if (!entrevista) {
            await transaccion.rollback();
            return res.status(404).json({ error: 'Entrevista no encontrada.' });
        }

        const estadoAnterior = entrevista.estado;
        const estadoNuevo = estado || entrevista.estado;

        // Paso 1: Actualizar la Entrevista (respetando campos no enviados)
        await entrevista.update({
            fechaHora: fechaHora || entrevista.fechaHora,
            modalidad: modalidad || entrevista.modalidad,
            notas: notas !== undefined ? notas : entrevista.notas,
            estado: estadoNuevo
        }, { transaction: transaccion });

        // Paso 2: Dejar constancia en el historial
        await HistorialEntrevista.create({
            estadoAnterior: estadoAnterior,
            estadoNuevo: estadoNuevo,
            detalle: detalleHistorial,
            entrevistaId: entrevista.id
        }, { transaction: transaccion });

        await transaccion.commit();
        res.status(200).json(entrevista);

    } catch (error) {
        await transaccion.rollback();
        console.error('Error en PUT /api/entrevistas/:id:', error);
        res.status(500).json({ error: 'Ocurrió un error interno al actualizar la entrevista.' });
    }
});

/**
 * @route GET /api/entrevistas/:id/historial
 * @description Consulta la cronología de eventos y reprogramaciones de una entrevista.
 * @access Privado (Requiere Token)
 * @param {string} req.params.id - ID de la entrevista.
 * @returns {Array} 200 - Arreglo de registros de auditoría, ordenados desde el más reciente.
 * @returns {Object} 404 - Entrevista no encontrada.
 */
router.get('/:id/historial', verificarToken, async (req, res) => {
    const { id } = req.params;

    try {
        const entrevista = await Entrevista.findByPk(id);
        if (!entrevista) {
            return res.status(404).json({ error: 'Entrevista no encontrada.' });
        }

        const historial = await HistorialEntrevista.findAll({
            where: { entrevistaId: id }, 
            order: [['createdAt', 'DESC']] // El evento más reciente primero
        });

        res.status(200).json(historial);

    } catch (error) {
        console.error('Error en GET /api/entrevistas/:id/historial:', error);
        res.status(500).json({ error: 'Hubo un error interno al obtener el historial de la entrevista.' });
    }
});

module.exports = router;