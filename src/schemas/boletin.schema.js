const Joi = require('joi');

// ─── Esquemas anidados ──────────────────────────────────────────────────────

const institucionSchema = Joi.object({
  nombre: Joi.string().required(),
  nit: Joi.string().required(),
  codigoDane: Joi.string().allow(null, '').optional(),
  resolucion: Joi.string().allow(null, '').optional(),
  logoUrl: Joi.string().uri().allow(null, '').optional(),
  selloUrl: Joi.string().uri().allow(null, '').optional(),
  firmaRectorUrl: Joi.string().uri().allow(null, '').optional(),
  banderaUrl: Joi.string().uri().allow(null, '').optional(),
  direccion: Joi.string().allow(null, '').optional(),
  sede: Joi.string().allow(null, '').optional(),
  nombreRector: Joi.string().allow(null, '').optional(),
});

const periodoReporteSchema = Joi.object({
  nombre: Joi.string().required(),
  fechaInicio: Joi.string().allow(null, '').optional(),
  fechaFin: Joi.string().allow(null, '').optional(),
});

const periodoInfoSchema = Joi.object({
  nombre: Joi.string().required(),
  porcentaje: Joi.number().min(0).max(100).required(),
  fechaInicio: Joi.string().allow(null, '').optional(),
  fechaFin: Joi.string().allow(null, '').optional(),
});

const estudianteSchema = Joi.object({
  documento: Joi.string().required(),
  nombreCompleto: Joi.string().required(),
});

const gradoSchema = Joi.object({
  nombre: Joi.string().required(),
  nivel: Joi.string().allow(null, '').optional(),
  directorNombre: Joi.string().allow(null, '').optional(),
  firmaDirectorUrl: Joi.string().uri().allow(null, '').optional(),
});

const detalleNotaSchema = Joi.object({
  nombrePeriodo: Joi.string().required(),
  porcentaje: Joi.number().required(),
  valor: Joi.number().min(0).max(5).required(),
  aporte: Joi.number().required(),
  // Campos opcionales del nuevo diseño de boletín (aún no enviados por gestion-academica)
  desempeno: Joi.string().allow(null, '').optional(),
  faltasCJ: Joi.number().integer().min(0).allow(null).optional(),
  faltasSJ: Joi.number().integer().min(0).allow(null).optional(),
  puesto: Joi.alternatives(Joi.number().integer(), Joi.string()).allow(null, '').optional(),
});

// Datos del acumulado final que acompañan a notaDefinitiva (opcional)
const acumuladoSchema = Joi.object({
  desempeno: Joi.string().allow(null, '').optional(),
  faltasCJ: Joi.number().integer().min(0).allow(null).optional(),
  faltasSJ: Joi.number().integer().min(0).allow(null).optional(),
  puesto: Joi.alternatives(Joi.number().integer(), Joi.string()).allow(null, '').optional(),
});

const asignaturaSchema = Joi.object({
  nombre: Joi.string().required(),
  docente: Joi.string().allow(null, '').optional(),
  ihs: Joi.number().min(0).allow(null).optional(),
  notasPorPeriodo: Joi.array().items(detalleNotaSchema).min(0).required(),
  notaDefinitiva: Joi.number().min(0).max(5).allow(null).optional(),
  acumulado: acumuladoSchema.optional(),
});

// Fila de comportamiento del boletín: misma estructura de notas que una asignatura,
// pero sin IHS ni docente (no es una asignatura académica).
const comportamientoSchema = Joi.object({
  notasPorPeriodo: Joi.array().items(detalleNotaSchema).min(0).optional(),
  notaDefinitiva: Joi.number().min(0).max(5).allow(null).optional(),
  acumulado: acumuladoSchema.optional(),
});

// ─── Esquema principal del boletín ─────────────────────────────────────────

const boletinPayloadSchema = Joi.object({
  institucion: institucionSchema.required(),
  periodoReporte: periodoReporteSchema.required(),
  anioLectivo: Joi.number().integer().min(2000).max(2100).required(),
  periodos: Joi.array().items(periodoInfoSchema).min(1).required(),
  estudiante: estudianteSchema.required(),
  grado: gradoSchema.required(),
  asignaturas: Joi.array().items(asignaturaSchema).min(0).required(),
  comportamiento: comportamientoSchema.optional(),
});

module.exports = { boletinPayloadSchema };
