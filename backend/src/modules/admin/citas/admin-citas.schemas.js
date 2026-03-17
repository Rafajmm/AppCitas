const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const listCitasQuerySchema = Joi.object({
  negocioId: uuidV4.optional(),
  empleadoId: uuidV4.optional(),
  fechaDesde: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaHasta: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estado: Joi.string().valid('pendiente', 'confirmada', 'cancelada', 'completada', 'no_show').optional(),
}).required();

const updateCitaStatusSchema = Joi.object({
  estado: Joi.string().valid('confirmada', 'cancelada', 'completada', 'no_show').required(),
}).required();

module.exports = { uuidV4, listCitasQuerySchema, updateCitaStatusSchema };
