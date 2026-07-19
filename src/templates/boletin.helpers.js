'use strict';

/**
 * boletin.helpers.js
 * ─────────────────────────────────────────────────────────────
 * Funciones utilitarias puras para la construcción del boletín.
 * No dependen de ningún módulo externo.
 *
 * Estructura de la tabla de notas: por cada período (dinámico, según
 * payload.periodos) y por el bloque ACUMULADO FINAL se muestran 5
 * subcolumnas: C (calificación), DSPÑO (desempeño), FALTAS→CJ/SJ
 * (con/sin justificación) y P (puesto).
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
 * Formatea un valor genérico (texto o número) a cadena, o '' si es nulo.
 * @param {number|string|null} v
 * @returns {string}
 */
const fmtTxt = (v) => (v !== null && v !== undefined ? String(v) : '');

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

/**
 * Formatea un rango de fechas dd/mm/aaaa a dd/mm/aaaa. Retorna '' si faltan datos.
 * @param {string|null} inicio
 * @param {string|null} fin
 * @returns {string}
 */
const fmtRango = (inicio, fin) => {
  if (!inicio || !fin) return '';
  const toDMY = (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  };
  return `${toDMY(inicio)} A ${toDMY(fin)}`;
};

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
// Constructores del encabezado de la tabla (3 filas de thead)
// ─────────────────────────────────────────────────────────────

/**
 * Genera el <colgroup> con anchos explícitos para cada columna de la tabla.
 * Necesario porque la tabla usa table-layout:fixed con un número dinámico
 * de grupos (períodos + acumulado final); sin anchos explícitos el
 * navegador reparte el espacio de forma ambigua y el texto se superpone.
 * @param {Array} periodos
 * @returns {string}
 */
const buildColgroup = (periodos) => {
  const asigPct = 13;
  const ihsPct = 3;
  const numGrupos = periodos.length + 1; // + ACUMULADO FINAL
  const grupoPct = (100 - asigPct - ihsPct) / numGrupos;
  // Proporciones relativas dentro de un grupo: C | DSPÑO | CJ | SJ | P
  const ratios = [1.1, 1.5, 0.8, 0.8, 0.9];
  const ratioSum = ratios.reduce((a, b) => a + b, 0);
  const colsGrupo = ratios
    .map((r) => `<col style="width:${((grupoPct * r) / ratioSum).toFixed(2)}%">`)
    .join('');

  let cols = `<col style="width:${asigPct}%"><col style="width:${ihsPct}%">`;
  for (let i = 0; i < numGrupos; i++) {
    cols += colsGrupo;
  }
  return `<colgroup>${cols}</colgroup>`;
};

/**
 * Fila 1 del encabezado: nombre de cada período (colspan=5) con su rango de
 * fechas debajo. El bloque "ACUMULADO FINAL" se agrega de forma estática
 * en boletin.html.
 * @param {Array<{nombre:string, fechaInicio?:string, fechaFin?:string}>} periodos
 * @returns {string}
 */
const buildThPeriodos1 = (periodos) =>
  periodos
    .map((p) => {
      const rango = fmtRango(p.fechaInicio, p.fechaFin);
      return `<th class="th-periodo" colspan="5">${p.nombre.toUpperCase()}${
        rango ? `<br><span class="th-fecha">${rango}</span>` : ''
      }</th>`;
    })
    .join('');

/**
 * Fila 2 del encabezado: C | DSPÑO | FALTAS (colspan=2) | P, por cada período.
 * @param {Array} periodos
 * @returns {string}
 */
const buildThPeriodos2 = (periodos) =>
  periodos
    .map(
      () => `
      <th class="th-sub" rowspan="2">C</th>
      <th class="th-sub" rowspan="2">DSPÑO</th>
      <th class="th-sub" colspan="2">FALTAS</th>
      <th class="th-sub" rowspan="2">P</th>`,
    )
    .join('');

/**
 * Fila 3 del encabezado: CJ | SJ (bajo la columna FALTAS), por cada período.
 * @param {Array} periodos
 * @returns {string}
 */
const buildThPeriodos3 = (periodos) =>
  periodos
    .map(
      () => `
      <th class="th-sub th-sub-min">CJ</th>
      <th class="th-sub th-sub-min">SJ</th>`,
    )
    .join('');

// ─────────────────────────────────────────────────────────────
// Constructores de filas del cuerpo de la tabla
// ─────────────────────────────────────────────────────────────

/**
 * Genera las 5 celdas <td> (C, DSPÑO, CJ, SJ, P) de un período para una fila.
 * @param {object|null} np - Registro de notasPorPeriodo encontrado (o null)
 * @returns {string}
 */
const celdasPeriodo = (np) => {
  const val = np ? np.valor : null;
  return `
    <td class="td-nota${esBajo(val) ? ' bajo' : ''}">${val !== null && val !== undefined ? fmt(val) : ''}</td>
    <td class="td-txt">${np ? fmtTxt(np.desempeno) : ''}</td>
    <td class="td-nota">${np ? fmtTxt(np.faltasCJ) : ''}</td>
    <td class="td-nota">${np ? fmtTxt(np.faltasSJ) : ''}</td>
    <td class="td-nota">${np ? fmtTxt(np.puesto) : ''}</td>`;
};

/**
 * Genera las 5 celdas <td> del bloque ACUMULADO FINAL para una fila.
 * @param {number|null} notaDefinitiva
 * @param {object} [acumulado]
 * @returns {string}
 */
const celdasFinal = (notaDefinitiva, acumulado = {}) => `
    <td class="td-def${esBajo(notaDefinitiva) ? ' bajo' : ''}">${fmtDef(notaDefinitiva)}</td>
    <td class="td-txt">${fmtTxt(acumulado.desempeno)}</td>
    <td class="td-nota">${fmtTxt(acumulado.faltasCJ)}</td>
    <td class="td-nota">${fmtTxt(acumulado.faltasSJ)}</td>
    <td class="td-nota">${fmtTxt(acumulado.puesto)}</td>`;

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
          return celdasPeriodo(np || null);
        })
        .join('');

      const rowClass = idx % 2 === 0 ? '' : 'tr-alt';

      return `
        <tr class="${rowClass}">
          <td class="td-asig">${asig.nombre.toUpperCase()}</td>
          <td class="td-ihs">${fmtTxt(asig.ihs)}</td>
          ${celdas}
          ${celdasFinal(asig.notaDefinitiva, asig.acumulado || {})}
        </tr>`;
    })
    .join('');

/**
 * Genera la fila especial COMPORTAMIENTO (sin IHS ni docente).
 * @param {object|undefined} comportamiento
 * @param {Array<{nombre: string}>} periodos
 * @returns {string}
 */
const buildFilaComportamiento = (comportamiento, periodos) => {
  const notasPorPeriodo = comportamiento?.notasPorPeriodo || [];
  const celdas = periodos
    .map((p) => {
      const np = notasPorPeriodo.find((n) => n.nombrePeriodo === p.nombre);
      return celdasPeriodo(np || null);
    })
    .join('');

  return `
    <tr class="tr-comportamiento">
      <td class="td-asig">COMPORTAMIENTO</td>
      <td class="td-ihs"></td>
      ${celdas}
      ${celdasFinal(comportamiento?.notaDefinitiva ?? null, comportamiento?.acumulado || {})}
    </tr>`;
};

/**
 * Genera las 5 celdas <td> de la fila PROMEDIO SEMESTRE (una por período,
 * solo la columna C se calcula; el resto queda en blanco).
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
        <td class="td-txt"></td>
        <td class="td-nota"></td>
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
  fmtTxt,
  esBajo,
  getFechaEmision,
  fmtRango,
  imgTag,
  buildColgroup,
  buildThPeriodos1,
  buildThPeriodos2,
  buildThPeriodos3,
  buildFilasAsignaturas,
  buildFilaComportamiento,
  buildPromediosPeriodo,
  calcPromedioFinal,
};
