const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const listServiciosQuerySchema = Joi.object({
  negocioId: uuidV4.optional(),
}).required();

const createServicioSchema = Joi.object({
  negocioId: uuidV4.required(),
  nombre: Joi.string().min(1).max(120).required(),
  descripcion: Joi.string().allow('', null).max(2000).optional(),
  duracion_minutos: Joi.number().integer().min(1).max(24 * 60).required(),
  precio: Joi.number().min(0).required(),
  activo: Joi.boolean().default(true),
}).required();

const updateServicioSchema = Joi.object({
  nombre: Joi.string().min(1).max(120).optional(),
  descripcion: Joi.string().allow('', null).max(2000).optional(),
  duracion_minutos: Joi.number().integer().min(1).max(24 * 60).optional(),
  precio: Joi.number().min(0).optional(),
  activo: Joi.boolean().optional(),
})
  .min(1)
  .required();

module.exports = { uuidV4, listServiciosQuerySchema, createServicioSchema, updateServicioSchema };
