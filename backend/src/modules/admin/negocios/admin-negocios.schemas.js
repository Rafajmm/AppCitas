const Joi = require('joi');

const uuidV4 = Joi.string().guid({ version: 'uuidv4' });

const patchNegocioSchema = Joi.object({
  descripcion: Joi.string().max(1000).allow(null, ''),
  logo_url: Joi.string().uri().max(500).allow(null, ''),
  color_primario: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, ''),
  color_secundario: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, ''),
  color_acento: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).allow(null, ''),
  whatsapp: Joi.string().max(20).allow(null, ''),
  web_url: Joi.string().uri().max(500).allow(null, ''),
  reservas_habilitadas: Joi.boolean(),
  antelacion_minima_horas: Joi.number().integer().min(0).max(168),
  tiempo_confirmacion_minutos: Joi.number().integer().min(1).max(1440),
  activo: Joi.boolean(),
}).min(1);

module.exports = { uuidV4, patchNegocioSchema };
