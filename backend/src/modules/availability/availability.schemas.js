const Joi = require('joi');

const getSlotsQuerySchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  serviceIds: Joi.string().required(),
  employeeId: Joi.string().guid({ version: 'uuidv4' }).optional(),
  slotMinutes: Joi.number().integer().min(5).max(180).default(15),
}).required();

module.exports = { getSlotsQuerySchema };
