const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const listEmpleadosQuerySchema = Joi.object({
  negocioId: uuidV4.optional(),
}).required();

const createEmpleadoSchema = Joi.object({
  negocioId: uuidV4.required(),
  nombre: Joi.string().min(1).max(120).required(),
  email: Joi.string().email().allow('', null).max(255).optional(),
  telefono: Joi.string().allow('', null).max(50).optional(),
  foto_url: Joi.string().uri().allow('', null).max(500).optional(),
  activo: Joi.boolean().default(true),
}).required();

const updateEmpleadoSchema = Joi.object({
  nombre: Joi.string().min(1).max(120).optional(),
  email: Joi.string().email().allow('', null).max(255).optional(),
  telefono: Joi.string().allow('', null).max(50).optional(),
  foto_url: Joi.string().uri().allow('', null).max(500).optional(),
  activo: Joi.boolean().optional(),
})
  .min(1)
  .required();

module.exports = { uuidV4, listEmpleadosQuerySchema, createEmpleadoSchema, updateEmpleadoSchema };
