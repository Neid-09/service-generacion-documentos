"use strict";

/**
 * boletin.template.js
 * ─────────────────────────────────────────────────────────────
 * Orquestador del boletín académico.
 *
 * Responsabilidades:
 *   1. Leer la plantilla HTML (boletin.html) y los estilos CSS (boletin.styles.css)
 *   2. Llamar a los helpers para construir las secciones dinámicas
 *   3. Reemplazar los placeholders {{token}} en la plantilla
 *   4. Retornar el HTML completo listo para Puppeteer
 *
 * @module boletin.template
 */

const path = require("path");
const fs = require("fs");

const {
	getFechaEmision,
	imgTag,
	buildThPeriodos1,
	buildThPeriodos2,
	buildFilasAsignaturas,
	buildPromediosPeriodo,
	calcPromedioFinal,
} = require("./boletin.helpers");

// ─── Carga de archivos estáticos al iniciar el módulo (una sola vez) ────────
const TEMPLATE_DIR = __dirname;
const htmlTemplate = fs.readFileSync(
	path.join(TEMPLATE_DIR, "boletin.html"),
	"utf8",
);
const cssEstilos = fs.readFileSync(
	path.join(TEMPLATE_DIR, "boletin.styles.css"),
	"utf8",
);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera el HTML completo del boletín académico.
 *
 * @param {object} payload - Datos del boletín enviados por gestion-academica
 * @param {object} payload.institucion      - Datos de la institución educativa
 * @param {object} payload.periodoReporte   - Período actual que se está reportando
 * @param {number} payload.anioLectivo      - Año lectivo (ej: 2025)
 * @param {Array}  payload.periodos         - Lista de todos los períodos del año
 * @param {object} payload.estudiante       - Datos del estudiante
 * @param {object} payload.grado            - Datos del grado / grupo
 * @param {Array}  payload.asignaturas      - Lista de asignaturas con notas por período
 * @returns {string} HTML completo listo para renderizar con Puppeteer
 */
function generarHtmlBoletin(payload) {
	const {
		institucion,
		periodoReporte,
		anioLectivo,
		periodos,
		estudiante,
		grado,
		asignaturas,
	} = payload;

	// ── Secciones dinámicas ──────────────────────────────────────────────────
	const thPeriodos1 = buildThPeriodos1(periodos);
	const thPeriodos2 = buildThPeriodos2(periodos);
	const filasAsignaturas = buildFilasAsignaturas(asignaturas, periodos);
	const promediosPeriodo = buildPromediosPeriodo(asignaturas, periodos);
	const promedioFinal = calcPromedioFinal(asignaturas);

	// ── Datos de cabecera ────────────────────────────────────────────────────
	const logoTag = imgTag(institucion.logoUrl, "logo", "Logo institucional");
	const banderaTag = imgTag(
		institucion.banderaUrl || institucion.selloUrl,
		"bandera",
		"Bandera / Sello",
	);

	// ── Datos de firmas ──────────────────────────────────────────────────────
	const firmaRectorTag = imgTag(
		institucion.firmaRectorUrl,
		"firma-img",
		"Firma Rector",
	);
	const firmaDirectorTag = imgTag(
		grado?.firmaDirectorUrl,
		"firma-img",
		"Firma Director de Grupo",
	);

	// ── Tokens de texto simples ──────────────────────────────────────────────
	const tokens = {
		// Meta
		estilos: cssEstilos,
		anioLectivo: anioLectivo,
		periodoNombre: periodoReporte?.nombre || "",
		fechaEmision: getFechaEmision(),

		// Institución
		instNombre: institucion.nombre || "Institución Educativa",
		instNit: institucion.nit || "—",
		instDane: institucion.codigoDane || "—",
		instResolucion: institucion.resolucion
			? `CREADA SEGÚN ${institucion.resolucion}<br>`
			: "",
		instDireccion: institucion.direccion
			? `<br>${institucion.direccion.toUpperCase()}`
			: "",
		logoTag,
		banderaTag,

		// Footer
		footerDireccion: institucion.direccion
			? `<div>${institucion.direccion}</div>`
			: "",

		// Estudiante
		estudianteNombre: (estudiante.nombreCompleto || "").toUpperCase(),

		// Grado
		gradoNombre: (grado?.nombre || "").toUpperCase(),
		gradoSede: grado?.nombre
			? `<div class="boletin-sede">${grado.nombre}</div>`
			: "",

		// Tabla de notas
		thPeriodos1,
		thPeriodos2,
		filasAsignaturas,
		promediosPeriodo,
		promedioFinal,

		// Firmas
		firmaRectorTag,
		firmaDirectorTag,
		rectorNombre: (institucion.nombreRector || "Rector(a)").toUpperCase(),
		directorNombre: (
			grado?.directorNombre || "Director(a) de Grupo"
		).toUpperCase(),
	};

	// ── Reemplazar placeholders en la plantilla HTML ─────────────────────────
	return htmlTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
		const value = tokens[key];
		if (value === undefined) {
			console.warn(`[boletin.template] Placeholder no definido: {{${key}}}`);
			return "";
		}
		return value;
	});
}

module.exports = { generarHtmlBoletin };
