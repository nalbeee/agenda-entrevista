const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Importamos los modelos desde el archivo de asociaciones centralizado
const { Entrevista, Postulante, Usuario, HistorialEntrevista } = require('../modelos/asociaciones');
// Importamos la conexión de la base de datos para la gestión de transacciones
const sequelize = require('../db');

/**
 * 1. GET /api/entrevistas
 * PROPÓSITO: Obtener el listado completo de entrevistas ordenadas por fecha.
 * INCLUYE: Datos del postulante y del entrevistador (JOIN).
 */
router.get('/', async (req, res) => {
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
router.post('/', async (req, res) => {
    const { fechaHora, modalidad, notas, entrevistadorId, postulanteId } = req.body;

    // Iniciamos una transacción gestionada por Sequelize
    const transaccion = await sequelize.transaction();

    try {
        // REGLA DE NEGOCIO: Validar superposición de horarios para el mismo entrevistador
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
            fechaHora,
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

module.exports = router;