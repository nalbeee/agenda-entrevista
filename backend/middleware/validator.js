/**
 * @file validator.js
 * @description Middleware centralizado para el manejo de errores de validación de datos.
 * Trabaja en conjunto con la librería express-validator para interceptar peticiones mal formadas
 * antes de que lleguen a los controladores y a la base de datos.
 */

const { validationResult } = require('express-validator');

/**
 * @function validarCampos
 * @description Verifica si las validaciones previas (ej. isEmail, notEmpty) arrojaron algún error.
 * Si encuentra errores, interrumpe el flujo y responde inmediatamente con un código HTTP 400.
 * Si todo está correcto, permite que la petición continúe su ciclo de vida.
 * @param {Object} req - Objeto de petición de Express. Contiene los datos a validar.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware o controlador.
 * @returns {Object|void} 400 - Objeto JSON con el mensaje de error genérico y el arreglo de detalles.
 */
const validarCampos = (req, res, next) => {
    // validationResult recolecta todos los errores que hayamos definido en la ruta
    const errores = validationResult(req);
    
    if (!errores.isEmpty()) {
        // Si hay errores, frenamos la petición acá mismo y devolvemos código 400 (Bad Request).
        // Esto cumple explícitamente con la exigencia del TP de devolver errores en formato JSON claro.
        return res.status(400).json({ 
            error: "Error en la validación de los datos enviados",
            detalles: errores.array() 
        });
    }
    
    // Si el arreglo de errores está vacío, los datos son válidos. 
    // Le decimos a Express que continúe hacia el controlador principal.
    next();
};

module.exports = {
    validarCampos
};