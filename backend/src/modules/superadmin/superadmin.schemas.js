const Joi = require('joi');

const crearAdminSchema = Joi.object({
  nombre: Joi.string().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(100).required(),
  telefono: Joi.string().max(20).allow('').optional(),
  rol: Joi.string().valid('admin', 'superadmin').default('admin'),
});

const actualizarAdminSchema = Joi.object({
  nombre: Joi.string().max(100).optional(),
  email: Joi.string().email().allow('').optional(),
  password: Joi.string().min(4).max(100).allow('').optional(),
  telefono: Joi.string().max(20).allow('').optional(),
  rol: Joi.string().valid('admin', 'superadmin').optional(),
});

const crearNegocioSchema = Joi.object({
  nombre: Joi.string().max(200).required(),
  slug: Joi.string().max(200).required(),
  descripcion: Joi.string().allow('').optional(),
  direccion: Joi.string().allow('').optional(),
  telefono: Joi.string().max(20).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  color_primario: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#3B82F6'),
  color_secundario: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#10B981'),
  color_acento: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#c0cc11'),
  whatsapp: Joi.string().max(20).allow('').optional(),
  web_url: Joi.string().uri().allow('').optional(),
  reservas_habilitadas: Joi.boolean().default(true),
  antelacion_minima_horas: Joi.number().integer().min(0).default(2),
  tiempo_confirmacion_minutos: Joi.number().integer().min(0).default(30),
});

const actualizarNegocioSchema = Joi.object({
  nombre: Joi.string().max(200).optional(),
  descripcion: Joi.string().allow('').optional(),
  direccion: Joi.string().allow('').optional(),
  telefono: Joi.string().max(20).allow('').optional(),
  email: Joi.string().email().allow('').optional(),
  color_primario: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  color_secundario: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  color_acento: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  whatsapp: Joi.string().max(20).allow('').optional(),
  web_url: Joi.string().uri().allow('').optional(),
  reservas_habilitadas: Joi.boolean().optional(),
  antelacion_minima_horas: Joi.number().integer().min(0).optional(),
  tiempo_confirmacion_minutos: Joi.number().integer().min(0).optional(),
});

const asignarAdminsSchema = Joi.object({
  administrador_ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

const uuidSchema = Joi.string().uuid();

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  activo: Joi.boolean().optional(),
});

module.exports = {
  crearAdminSchema,
  actualizarAdminSchema,
  crearNegocioSchema,
  actualizarNegocioSchema,
  asignarAdminsSchema,
  uuidSchema,
  paginationSchema,
};
