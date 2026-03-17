const { Controller, Get, Post, Req, Inject, BadRequestException, NotFoundException } = require('@nestjs/common');
const { PublicService } = require('./public.service');
const { createBookingBodySchema } = require('./public.schemas');

class PublicController {
  constructor(publicService) {
    this.publicService = publicService;
  }

  async listNegocios() {
    return await this.publicService.listNegocios();
  }

  async getNegocio(req) {
    const slug = req.params.slug;
    const negocio = await this.publicService.getNegocioBySlug(slug);
    if (!negocio) throw new NotFoundException('Negocio not found');
    return negocio;
  }

  async listServicios(req) {
    const slug = req.params.slug;
    return await this.publicService.listServiciosBySlug(slug);
  }

  async createBooking(req) {
    const slug = req.params.slug;
    const body = req.body;
    const { value, error } = createBookingBodySchema.validate(body, { abortEarly: false, stripUnknown: true });
    if (error) throw new BadRequestException(error.details.map((d) => d.message));

    return await this.publicService.createBooking({ slug, ...value });
  }

  async getAvailability(req) {
    const slug = req.params.slug;
    const { date, serviceIds, employeeId } = req.query;
    
    if (!date || !serviceIds) {
      throw new BadRequestException('date and serviceIds are required');
    }
    
    const serviceIdsArray = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
    
    return await this.publicService.getAvailability(slug, date, serviceIdsArray, employeeId);
  }

  async confirmBooking(req) {
    const token = req.params.token;
    return await this.publicService.confirmBooking(token);
  }

  async resendConfirmation(req) {
    const { email, name, date, startTime } = req.body;
    return await this.publicService.resendConfirmation(email, name, date, startTime);
  }
}

Controller('public')(PublicController);
Inject(PublicService)(PublicController, undefined, 0);

Get('negocios')(PublicController.prototype, 'listNegocios', Object.getOwnPropertyDescriptor(PublicController.prototype, 'listNegocios'));

Get(':slug')(PublicController.prototype, 'getNegocio', Object.getOwnPropertyDescriptor(PublicController.prototype, 'getNegocio'));
Req()(PublicController.prototype, 'getNegocio', 0);

Get(':slug/servicios')(PublicController.prototype, 'listServicios', Object.getOwnPropertyDescriptor(PublicController.prototype, 'listServicios'));
Req()(PublicController.prototype, 'listServicios', 0);

Get(':slug/availability')(PublicController.prototype, 'getAvailability', Object.getOwnPropertyDescriptor(PublicController.prototype, 'getAvailability'));
Req()(PublicController.prototype, 'getAvailability', 0);

Post(':slug/bookings')(PublicController.prototype, 'createBooking', Object.getOwnPropertyDescriptor(PublicController.prototype, 'createBooking'));
Req()(PublicController.prototype, 'createBooking', 0);

Post('confirm/:token')(PublicController.prototype, 'confirmBooking', Object.getOwnPropertyDescriptor(PublicController.prototype, 'confirmBooking'));
Req()(PublicController.prototype, 'confirmBooking', 0);

Post('resend-confirmation')(PublicController.prototype, 'resendConfirmation', Object.getOwnPropertyDescriptor(PublicController.prototype, 'resendConfirmation'));
Req()(PublicController.prototype, 'resendConfirmation', 0);

module.exports = { PublicController };
