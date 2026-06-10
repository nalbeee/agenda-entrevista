/**
 * @file auth.js
 * @description Middlewares de seguridad para la autenticación y autorización.
 * Gestiona la validación de tokens JWT y restringe el acceso a rutas protegidas
 * dependiendo del rol del usuario autenticado.
 */

const jwt = require('jsonwebtoken');

/**
 * @function verificarToken
 * @description Middleware que intercepta la petición HTTP para validar la presencia y autenticidad
 * de un token JWT en la cabecera 'Authorization'. Si el token es válido, inyecta los datos 
 * del usuario en el objeto `req` para que las siguientes rutas puedan consumirlo.
 * @param {Object} req - Objeto de petición de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware o controlador.
 * @returns {Object} 401 - Si no se proporciona token o el formato no es 'Bearer <token>'.
 * @returns {Object} 403 - Si el token fue alterado, es inválido o ha expirado su tiempo de vida.
 */
const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en la cabecera 'Authorization'
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
    }

    // 2. Separamos la palabra "Bearer" del token real
    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Formato de token inválido.' });
    }

    try {
        // 3. Verificamos que el token sea auténtico usando la clave secreta del .env
        const usuarioDecodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Inyectamos los datos del usuario (payload) en la petición para que las rutas los conozcan
        req.usuario = usuarioDecodificado; 
        
        // 5. ¡Todo bien! Continuamos al siguiente paso
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Acceso denegado. El token es inválido o ha expirado.' });
    }
};

/**
 * @function verificarRolAdmin
 * @description Middleware de autorización que restringe el acceso únicamente a usuarios
 * que posean el rol de administrador. Requiere que `verificarToken` se haya ejecutado previamente.
 * @param {Object} req - Objeto de petición de Express (debe contener req.usuario).
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware o controlador.
 * @returns {Object} 403 - Si el usuario no está autenticado o su rol no es 'admin'.
 */
const verificarRolAdmin = (req, res, next) => {
    // Verificamos que el usuario exista en la request (inyectado por verificarToken) y que su rol sea el correcto
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Esta acción requiere privilegios de administrador.' });
    }
    
    next();
};

module.exports = {
    verificarToken,
    verificarRolAdmin
};