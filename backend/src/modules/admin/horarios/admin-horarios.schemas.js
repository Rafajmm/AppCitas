const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const timeSchema = Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required();

const horarioDiaSchema = Joi.object({
  dia_semana: Joi.number().integer().min(0).max(6).required(),
  hora_apertura: timeSchema.required(),
  hora_cierre: timeSchema.required(),
  activo: Joi.boolean().default(true),
}).required();

const updateHorariosNegocioSchema = Joi.object({
  horarios: Joi.array().items(horarioDiaSchema).min(1).max(7).required(),
}).required();

const updateHorariosEmpleadoSchema = Joi.object({
  horarios: Joi.array().items(horarioDiaSchema).min(1).max(7).required(),
}).required();

module.exports = {
  uuidV4,
  timeSchema,
  horarioDiaSchema,
  updateHorariosNegocioSchema,
  updateHorariosEmpleadoSchema,
};
