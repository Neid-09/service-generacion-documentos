const logger = require('../helpers/logger');

/**
 * Middleware de autenticación por API Key.
 * La clave debe viajar en el header: X-API-Key
 *
 * El microservicio solo acepta llamadas del backend gestion-academica.
 * Esta API Key simple es suficiente para comunicación interna entre servicios.
 */
function apiKeyMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    logger.error('API_KEY no está configurada en las variables de entorno');
    return res.status(500).json({ error: 'Configuración del servidor incompleta' });
  }

  if (!apiKey || apiKey !== expectedKey) {
    logger.warn('Intento de acceso con API Key inválida o ausente', {
      ip: req.ip,
      path: req.path,
    });
    return res.status(401).json({ error: 'API Key inválida o ausente' });
  }

  next();
}

module.exports = { apiKeyMiddleware };
