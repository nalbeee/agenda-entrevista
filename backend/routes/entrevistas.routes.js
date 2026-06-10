const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { body } = require('express-validator');
const { validarCampos } = require('../middleware/validator');
const { verificarToken } = require('../middleware/auth');

// Importamos los modelos desde el archivo de asociaciones centralizado
const { Entrevista, Postulante, Usuario, HistorialEntrevista } = require('../modelos/asociaciones');
// Importamos la conexión de la base de datos para la gestión de transacciones
const sequelize = require('../db');

/**
 * 1. GET /api/entrevistas
 * PROPÓSITO: Obtener el listado completo de entrevistas ordenadas por fecha.
 * INCLUYE: Datos del postulante y del entrevistador (JOIN).
 */
router.get('/', verificarToken,async (req, res) => {
    try {
        const entrevistas = await Entrevista.findAll({
            // Sequelize une automáticamente las tablas usando las claves foráneas configuradas
            include: [
                {
                    model: Postulante,
                    as: 'postulante',
                    attributes: ['id', 'nombres', 'apellidos', 'email'] // Campos necesarios para el frontend
                },
                {
                    model: Usuario,
                    as: 'entrevistador',
                    attributes: ['id', 'nombre', 'email']
                }
            ],
            // Ordenamos cronológicamente: de la más cercana a la más lejana
            order: [['fechaHora', 'ASC']]
        });

        // Respuesta exitosa al frontend
        res.status(200).json(entrevistas);
    } catch (error) {
        console.error('Error en GET /api/entrevistas:', error);
        res.status(500).json({ error: 'Hubo un error interno al intentar obtener las entrevistas.' });
    }
});

/**
 * 2. POST /api/entrevistas
 * PROPÓSITO: Registrar una nueva entrevista validando horarios y guardando en el historial de forma atómica.
 */

router.post('/', [
    verificarToken, // 🔒 Candado activado
    
    // --- REGLAS DE VALIDACIÓN DE ENTRADA ---
    body('fechaHora')
        .notEmpty().withMessage('La fecha y hora son obligatorias.')
        .isISO8601().withMessage('Debe ser una fecha válida (formato ISO 8601).'),
    
    body('modalidad')
        .notEmpty().withMessage('La modalidad es obligatoria.')
        .isIn(['virtual', 'presencial']).withMessage('La modalidad debe ser "virtual" o "presencial".'),
    
    body('entrevistadorId')
        .notEmpty().withMessage('El ID del entrevistador es obligatorio.')
        .isInt({ min: 1 }).withMessage('El ID del entrevistador debe ser un número entero positivo.'),
    
    body('postulanteId')
        .notEmpty().withMessage('El ID del postulante es obligatorio.')
        .isInt({ min: 1 }).withMessage('El ID del postulante debe ser un número entero positivo.'),
    
    body('notas')
        .optional() // Las notas no son obligatorias
        .isString().withMessage('Las notas deben ser texto.')
        .isLength({ max: 255 }).withMessage('Las notas no pueden superar los 255 caracteres.'),

    // --- MIDDLEWARE QUE REVISA LAS REGLAS ---
    validarCampos
], async (req, res) => {
    
    // CORRECCIÓN 1 y 2: Extraemos todas las variables necesarias una sola vez, incluyendo fechaHora
    const { fechaHora, modalidad, notas, entrevistadorId, postulanteId } = req.body;

    // Iniciamos una transacción gestionada por Sequelize
    const transaccion = await sequelize.transaction();

    try {
        // CORRECCIÓN 3: Agregamos fechaHora al where para validar superposición exacta
        const entrevistaExistente = await Entrevista.findOne({
            where: {
                entrevistadorId: entrevistadorId,
                fechaHora: fechaHora,
                estado: { [Op.not]: 'cancelada' } // Ignoramos si la cita previa fue cancelada
            }
        });

        if (entrevistaExistente) {
            // Cancelamos el proceso inmediatamente si hay choque de agenda
            await transaccion.rollback();
            return res.status(400).json({ error: 'El entrevistador ya tiene una entrevista asignada en ese horario exacto.' });
        }

        // PASO A: Crear el registro principal de la Entrevista
        const nuevaEntrevista = await Entrevista.create({
            fechaHora, // Incluimos la fecha obligatoria
            modalidad,
            notas,
            entrevistadorId,
            postulanteId,
            estado: 'programada' // Estado por defecto al nacer la entrevista
        }, { transaction: transaccion });

        // PASO B: Crear el registro de auditoría en la tabla historial_entrevistas
        await HistorialEntrevista.create({
            estadoAnterior: null, // No existía un estado previo
            estadoNuevo: 'programada',
            detalle: 'Alta inicial del registro de entrevista',
            entrevistaId: nuevaEntrevista.id // Vinculamos al ID generado en el paso anterior
        }, { transaction: transaccion });

        // Confirmamos todos los cambios de forma simultánea en SQLite
        await transaccion.commit();

        // Enviamos el objeto creado con el código de estado 201 (Creado)
        res.status(201).json(nuevaEntrevista);

    } catch (error) {
        // Deshacemos cualquier inserción parcial para proteger la integridad de los datos
        await transaccion.rollback();
        console.error('Error en POST /api/entrevistas:', error);
        res.status(500).json({ error: 'Ocurrió un error interno al procesar el alta de la entrevista.' });
    }
});

/**
 * 3. PUT /api/entrevistas/:id
 * PROPÓSITO: Modificar una entrevista (reprogramar, cambiar estado) y dejar registro en el historial.
 */

router.put('/:id', [
    verificarToken, // 🔒 Candado activado
    // Validamos solo lo que nos envíen (todo es opcional al actualizar, excepto el motivo del historial)
    body('estado')
        .optional()
        .isIn(['programada', 'realizada', 'cancelada', 'reprogramada']).withMessage('Estado inválido.'),
    body('fechaHora')
        .optional()
        .isISO8601().withMessage('Debe ser una fecha válida.'),
    body('detalleHistorial')
        .notEmpty().withMessage('Es obligatorio enviar un "detalleHistorial" explicando el motivo del cambio.'),
    validarCampos
], async (req, res) => {
    const { id } = req.params;
    // Extraemos los datos que el frontend quiere actualizar
    const { fechaHora, modalidad, notas, estado, detalleHistorial } = req.body;

    const transaccion = await sequelize.transaction();

    try {
        // 1. Buscamos la entrevista original en la base de datos
        const entrevista = await Entrevista.findByPk(id);

        if (!entrevista) {
            await transaccion.rollback();
            return res.status(404).json({ error: 'Entrevista no encontrada.' });
        }

        // Guardamos cuál era el estado antes de tocar nada
        const estadoAnterior = entrevista.estado;
        const estadoNuevo = estado || entrevista.estado;

        // 2. Actualizamos los datos de la Entrevista (si no envían un dato, dejamos el que ya estaba)
        await entrevista.update({
            fechaHora: fechaHora || entrevista.fechaHora,
            modalidad: modalidad || entrevista.modalidad,
            notas: notas !== undefined ? notas : entrevista.notas,
            estado: estadoNuevo
        }, { transaction: transaccion });

        // 3. Creamos automáticamente el registro en el Historial
        await HistorialEntrevista.create({
            estadoAnterior: estadoAnterior,
            estadoNuevo: estadoNuevo,
            detalle: detalleHistorial, // Ej: "El postulante llamó para reprogramar por enfermedad"
            entrevistaId: entrevista.id
        }, { transaction: transaccion });

        await transaccion.commit();
        
        // Devolvemos la entrevista actualizada
        res.status(200).json(entrevista);

    } catch (error) {
        await transaccion.rollback();
        console.error('Error en PUT /api/entrevistas/:id:', error);
        res.status(500).json({ error: 'Ocurrió un error interno al actualizar la entrevista.' });
    }
});

/**
 * 4. GET /api/entrevistas/:id/historial
 * PROPÓSITO: Consultar toda la cronología de cambios de estado y reprogramaciones de una entrevista específica.
 */
router.get('/:id/historial', async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Primero verificamos si la entrevista realmente existe
        const entrevista = await Entrevista.findByPk(id);
        if (!entrevista) {
            return res.status(404).json({ error: 'Entrevista no encontrada.' });
        }

        // 2. Buscamos todos los registros del historial vinculados a este ID de entrevista
        const historial = await HistorialEntrevista.findAll({
            where: { entrevistaId: id }, 
            order: [['fechaCambio', 'DESC']]
        });

        // 3. Devolvemos la lista al frontend (puede ser un array vacío si nunca sufrió modificaciones)
        res.status(200).json(historial);

    } catch (error) {
        console.error('Error en GET /api/entrevistas/:id/historial:', error);
        res.status(500).json({ error: 'Hubo un error interno al obtener el historial de la entrevista.' });
    }
});

module.exports = router;