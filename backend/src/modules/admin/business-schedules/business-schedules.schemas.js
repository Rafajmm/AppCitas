const Joi = require('joi');

const businessSchemas = {
  updateBusinessSchedules: Joi.object({
    schedules: Joi.array().items(
      Joi.object({
        dia_semana: Joi.number().integer().min(0).max(6).required(),
        hora_apertura: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        hora_cierre: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        activo: Joi.boolean().default(true)
      })
    ).required()
  })
};

module.exports = { businessSchemas };
