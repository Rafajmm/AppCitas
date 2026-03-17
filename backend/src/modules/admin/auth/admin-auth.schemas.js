const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(100).required(),
}).required();

module.exports = { loginSchema };
