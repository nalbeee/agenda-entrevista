const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar si el usuario tiene un Token JWT válido
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
        
        // 4. Inyectamos los datos del usuario en la petición para que las rutas los conozcan
        req.usuario = usuarioDecodificado; 
        
        // 5. ¡Todo bien! Continuamos al siguiente paso
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Acceso denegado. El token es inválido o ha expirado.' });
    }
};

/**
 * Middleware para verificar si el usuario es administrador
 */
const verificarRolAdmin = (req, res, next) => {
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Esta acción requiere privilegios de administrador.' });
    }
    next();
};

module.exports = {
    verificarToken,
    verificarRolAdmin
};