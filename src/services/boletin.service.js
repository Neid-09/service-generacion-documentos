const { htmlToPdf } = require('../helpers/pdf.helper');
const { generarHtmlBoletin } = require('../templates/boletin.template');
const logger = require('../helpers/logger');

/**
 * Orquesta la generación del boletín:
 * 1. Genera el HTML usando la plantilla
 * 2. Convierte el HTML a PDF con Puppeteer
 *
 * @param {object} payload - Payload validado con todos los datos del boletín
 * @returns {Promise<Buffer>} - PDF como buffer
 */
async function generarBoletin(payload) {
  const { estudiante, periodoReporte } = payload;

  logger.info('Iniciando generación de boletín', {
    estudiante: estudiante?.documento,
    periodo: periodoReporte?.nombre,
  });

  const html = generarHtmlBoletin(payload);
  const pdfBuffer = await htmlToPdf(html);

  logger.info('Boletín generado exitosamente', {
    estudiante: estudiante?.documento,
    periodo: periodoReporte?.nombre,
    tamaño: `${(pdfBuffer.length / 1024).toFixed(1)} KB`,
  });

  return pdfBuffer;
}

module.exports = { generarBoletin };
