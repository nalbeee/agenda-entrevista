const { validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
    // validationResult recolecta todos los errores que encontremos en la petición
    const errores = validationResult(req);
    
    if (!errores.isEmpty()) {
        // Si hay errores, frenamos la petición acá mismo y devolvemos código 400 (Bad Request)
        // El TP exige devolver errores en formato JSON predecible
        return res.status(400).json({ 
            error: "Error en la validación de los datos enviados",
            detalles: errores.array() 
        });
    }
    
    // Si no hay errores, le decimos a Express que continúe hacia el controlador (la ruta POST)
    next();
};

module.exports = {
    validarCampos
};