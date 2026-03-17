const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const listBloqueosQuerySchema = Joi.object({
  negocioId: uuidV4.optional(),
  empleadoId: uuidV4.optional(),
  fechaDesde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaHasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).required();

const createBloqueoSchema = Joi.object({
  negocioId: uuidV4.required(),
  empleadoId: uuidV4.allow(null).optional(),
  fecha_inicio: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  fecha_fin: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  hora_inicio: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null).optional(),
  hora_fin: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).allow(null).optional(),
  titulo: Joi.string().min(1).max(200).required(),
  descripcion: Joi.string().allow('', null).max(1000).optional(),
  activo: Joi.boolean().default(true),
}).required();

module.exports = { uuidV4, listBloqueosQuerySchema, createBloqueoSchema };
