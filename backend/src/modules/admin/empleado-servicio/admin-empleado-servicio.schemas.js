const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const listServiciosByEmpleadoQuerySchema = Joi.object({}).required();

const assignServicioSchema = Joi.object({
  empleadoId: uuidV4.required(),
  servicioId: uuidV4.required(),
}).required();

module.exports = { uuidV4, listServiciosByEmpleadoQuerySchema, assignServicioSchema };
