const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const createBookingBodySchema = Joi.object({
  employeeId: uuidV4.optional().allow(null),
  serviceIds: Joi.array().items(uuidV4).min(1).required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required(),
  client: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().allow(null, ''),
    phone: Joi.string().max(20).allow(null, ''),
  }).required(),
  notes: Joi.string().allow(null, ''),
}).required();

module.exports = { createBookingBodySchema };
