const express = require('express');
const { generarBoletin } = require('../services/boletin.service');
const { boletinPayloadSchema } = require('../schemas/boletin.schema');
const logger = require('../helpers/logger');

const router = express.Router();

/**
 * POST /generar/boletin
 *
 * Recibe el payload completo del boletín académico desde gestion-academica,
 * genera el PDF y lo devuelve como stream binario.
 *
 * Body: BoletinPayload (JSON)
 * Response: application/pdf
 */
router.post('/boletin', async (req, res) => {
  // 1. Validar payload con Joi
  const { error, value: payload } = boletinPayloadSchema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    logger.warn('Payload de boletín inválido', {
      errores: error.details.map((d) => d.message),
    });
    return res.status(400).json({
      error: 'Payload inválido',
      detalles: error.details.map((d) => d.message),
    });
  }

  try {
    // 2. Generar PDF
    const pdfBuffer = await generarBoletin(payload);

    // 3. Construir nombre de archivo descriptivo
    const docEstudiante = payload.estudiante.documento;
    const periodo = payload.periodoReporte?.nombre?.replace(/\s+/g, '_') || 'periodo';
    const anio = payload.anioLectivo;
    const filename = `boletin_${docEstudiante}_${periodo}_${anio}.pdf`;

    // 4. Responder con el PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
      'X-Generated-By': 'service-generacion-documentos',
    });

    return res.end(pdfBuffer);
  } catch (err) {
    logger.error('Error generando boletín PDF', { error: err.message, stack: err.stack });
    return res.status(500).json({
      error: 'Error interno al generar el documento',
      detalle: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

module.exports = router;
