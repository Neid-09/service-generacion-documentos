require('dotenv').config();

const express = require('express');
const { apiKeyMiddleware } = require('./middleware/apiKey.middleware');
const documentosRouter = require('./routes/documentos.routes');
const logger = require('./helpers/logger');

const app = express();
const PORT = process.env.PORT || 3100;

// ─── Parsers ────────────────────────────────────────────────────────────────
// Límite generoso: los payloads de boletín pueden ser grandes (muchas asignaturas)
app.use(express.json({ limit: '2mb' }));

// ─── Health check (sin API Key — para load balancers y Docker healthcheck) ──
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'service-generacion-documentos',
    timestamp: new Date().toISOString(),
  });
});

// ─── Rutas protegidas por API Key ────────────────────────────────────────────
app.use('/generar', apiKeyMiddleware, documentosRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ─── Error handler global ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  logger.error('Error no capturado', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Inicio ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 service-generacion-documentos escuchando en puerto ${PORT}`);
  logger.info(`   → Health: http://localhost:${PORT}/health`);
  logger.info(`   → Boletín: POST http://localhost:${PORT}/generar/boletin`);
  logger.info(`   → NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
