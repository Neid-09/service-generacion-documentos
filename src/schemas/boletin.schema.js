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
  directorNombre: Joi.string().allow(null, '').optional(),
  firmaDirectorUrl: Joi.string().uri().allow(null, '').optional(),
});

const detalleNotaSchema = Joi.object({
  nombrePeriodo: Joi.string().required(),
  porcentaje: Joi.number().required(),
  valor: Joi.number().min(0).max(5).required(),
  aporte: Joi.number().required(),
});

const asignaturaSchema = Joi.object({
  nombre: Joi.string().required(),
  docente: Joi.string().allow(null, '').optional(),
  notasPorPeriodo: Joi.array().items(detalleNotaSchema).min(0).required(),
  notaDefinitiva: Joi.number().min(0).max(5).allow(null).optional(),
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
  // puesto: Joi.number().integer().allow(null).optional(), // TODO: requiere ranking de compañeros
});

module.exports = { boletinPayloadSchema };
