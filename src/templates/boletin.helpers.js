'use strict';

/**
 * boletin.helpers.js
 * ─────────────────────────────────────────────────────────────
 * Funciones utilitarias puras para la construcción del boletín.
 * No dependen de ningún módulo externo.
 * ─────────────────────────────────────────────────────────────
 */

// ─────────────────────────────────────────────────────────────
// Formateadores numéricos
// ─────────────────────────────────────────────────────────────

/**
 * Formatea un número a 1 decimal. Retorna '' si el valor es nulo/undefined.
 * @param {number|null} n
 * @returns {string}
 */
const fmt = (n) =>
  n !== null && n !== undefined ? Number(n).toFixed(1) : '';

/**
 * Formatea un número a 2 decimales. Retorna '' si el valor es nulo/undefined.
 * @param {number|null} n
 * @returns {string}
 */
const fmtDef = (n) =>
  n !== null && n !== undefined ? Number(n).toFixed(2) : '';

/**
 * Indica si una nota está reprobada (< 3.0).
 * @param {number|null} n
 * @returns {boolean}
 */
const esBajo = (n) =>
  n !== null && n !== undefined && Number(n) < 3.0;

// ─────────────────────────────────────────────────────────────
// Formateadores de fecha
// ─────────────────────────────────────────────────────────────

/**
 * Retorna la fecha actual formateada en español colombiano.
 * Ejemplo: "1 de junio de 2026"
 * @returns {string}
 */
const getFechaEmision = () =>
  new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

// ─────────────────────────────────────────────────────────────
// Generadores de etiquetas HTML
// ─────────────────────────────────────────────────────────────

/**
 * Retorna un <img> si hay URL, o un <span> vacío como placeholder.
 * @param {string|null} url
 * @param {string} cls  - Clase CSS a aplicar
 * @param {string} alt  - Texto alternativo de la imagen
 * @returns {string}
 */
const imgTag = (url, cls, alt) =>
  url
    ? `<img class="${cls}" src="${url}" alt="${alt}" />`
    : `<span class="${cls}"></span>`;

// ─────────────────────────────────────────────────────────────
// Constructores de secciones dinámicas de la tabla
// ─────────────────────────────────────────────────────────────

/**
 * Genera los <th> de la Fila 1 del encabezado (nombre de cada período).
 * @param {Array<{nombre: string}>} periodos
 * @returns {string} - HTML de celdas th
 */
const buildThPeriodos1 = (periodos) =>
  periodos
    .map((p) => `<th class="th-periodo" colspan="3">${p.nombre.toUpperCase()}</th>`)
    .join('');

/**
 * Genera los <th> de la Fila 2 del encabezado (sub-etiquetas C | CSI | FALTAS).
 * @param {Array} periodos
 * @returns {string} - HTML de celdas th
 */
const buildThPeriodos2 = (periodos) =>
  periodos
    .map(() => `
      <th class="th-sub">C</th>
      <th class="th-sub">CSI</th>
      <th class="th-sub">FALTAS</th>`)
    .join('');

/**
 * Genera todas las filas <tr> de asignaturas en el tbody.
 * @param {Array} asignaturas
 * @param {Array<{nombre: string}>} periodos
 * @returns {string} - HTML de filas tr
 */
const buildFilasAsignaturas = (asignaturas, periodos) =>
  asignaturas
    .map((asig, idx) => {
      const celdas = periodos
        .map((p) => {
          const np = asig.notasPorPeriodo.find((n) => n.nombrePeriodo === p.nombre);
          const val = np ? np.valor : null;
          return `
            <td class="td-nota${esBajo(val) ? ' bajo' : ''}">${val !== null ? fmt(val) : ''}</td>
            <td class="td-nota"></td>
            <td class="td-nota"></td>`;
        })
        .join('');

      const def      = asig.notaDefinitiva;
      const rowClass = idx % 2 === 0 ? '' : 'tr-alt';

      return `
        <tr class="${rowClass}">
          <td class="td-asig">${asig.nombre.toUpperCase()}</td>
          <td class="td-nota">10</td>
          ${celdas}
          <td class="td-nota"></td>
          <td class="td-def${esBajo(def) ? ' bajo' : ''}">${fmtDef(def)}</td>
        </tr>`;
    })
    .join('');

/**
 * Genera las celdas <td> de la fila PROMEDIO (una por período).
 * @param {Array} asignaturas
 * @param {Array<{nombre: string}>} periodos
 * @returns {string} - HTML de celdas td
 */
const buildPromediosPeriodo = (asignaturas, periodos) =>
  periodos
    .map((p) => {
      const vals = asignaturas
        .map((a) => {
          const n = a.notasPorPeriodo.find((n) => n.nombrePeriodo === p.nombre);
          return n ? n.valor : null;
        })
        .filter((v) => v !== null);

      const avg = vals.length
        ? vals.reduce((acc, v) => acc + v, 0) / vals.length
        : null;

      return `
        <td class="td-nota prom-cell">${avg !== null ? fmt(avg) : ''}</td>
        <td class="td-nota"></td>
        <td class="td-nota"></td>`;
    })
    .join('');

/**
 * Calcula el promedio definitivo final de todas las asignaturas.
 * @param {Array<{notaDefinitiva: number|null}>} asignaturas
 * @returns {string} - Valor formateado o cadena vacía
 */
const calcPromedioFinal = (asignaturas) => {
  const vals = asignaturas
    .map((a) => a.notaDefinitiva)
    .filter((v) => v !== null && v !== undefined);
  if (!vals.length) return '';
  return fmtDef(vals.reduce((acc, v) => acc + v, 0) / vals.length);
};

// ─────────────────────────────────────────────────────────────
// Exportaciones
// ─────────────────────────────────────────────────────────────
module.exports = {
  fmt,
  fmtDef,
  esBajo,
  getFechaEmision,
  imgTag,
  buildThPeriodos1,
  buildThPeriodos2,
  buildFilasAsignaturas,
  buildPromediosPeriodo,
  calcPromedioFinal,
};
