const puppeteer = require('puppeteer');
const logger = require('./logger');

/**
 * Convierte un string HTML en un buffer PDF usando Puppeteer (Chromium headless).
 *
 * @param {string} htmlContent - Contenido HTML completo (con estilos inline o <style>)
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function htmlToPdf(htmlContent) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Cargar el HTML como contenido directo
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    logger.debug('PDF generado exitosamente', { tamaño: `${(pdfBuffer.length / 1024).toFixed(1)} KB` });

    return pdfBuffer;
  } catch (error) {
    logger.error('Error al generar PDF con Puppeteer', { error: error.message });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { htmlToPdf };
