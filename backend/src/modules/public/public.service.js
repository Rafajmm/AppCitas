const { Inject, Injectable, BadRequestException, NotFoundException } = require('@nestjs/common');
const { PublicRepository } = require('./public.repository');
const { EmailService } = require('../email/email.service');
const { AvailabilityService } = require('../availability/availability.service');
const { timeToMinutes, minutesToTime, getWeekday0Sunday } = require('../availability/availability.utils');

class PublicService {
  constructor(publicRepository, emailService, availabilityService) {
    this.publicRepository = publicRepository;
    this.emailService = emailService;
    this.availabilityService = availabilityService;
  }

  async listNegocios() {
    return await this.publicRepository.listNegocios();
  }

  async getNegocioBySlug(slug) {
    return await this.publicRepository.getNegocioBySlug(slug);
  }

  async listServiciosBySlug(slug) {
    const negocio = await this.publicRepository.getNegocioBySlug(slug);
    if (!negocio) throw new NotFoundException('Negocio not found');
    return await this.publicRepository.listServicios(negocio.id);
  }

  async createBooking({ slug, employeeId, serviceIds, date, startTime, client, notes }) {
    const negocio = await this.publicRepository.getNegocioBySlug(slug);
    if (!negocio) throw new NotFoundException('Negocio not found');
    if (!negocio.activo || !negocio.reservas_habilitadas) throw new BadRequestException('Bookings disabled');

    const services = await this.publicRepository.getServicesForBooking(negocio.id, serviceIds, employeeId);
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Some services are invalid/inactive or not offered by this business/employee');
    }

    const totalDuration = services.reduce((a, s) => a + Number(s.duracion_minutos), 0);
    const totalPrice = services.reduce((a, s) => a + Number(s.precio_final), 0);

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + totalDuration;
    if (endMinutes > 24 * 60) throw new BadRequestException('End time exceeds day');

    // Antelación mínima (UTC)
    const nowUtc = new Date();
    const minStartUtc = new Date(nowUtc.getTime() + Number(negocio.antelacion_minima_horas) * 60 * 60 * 1000);
    const requestedDay = new Date(date + 'T00:00:00.000Z');
    if (requestedDay.toISOString().slice(0, 10) === nowUtc.toISOString().slice(0, 10)) {
      const minStartMinutes = minStartUtc.getUTCHours() * 60 + minStartUtc.getUTCMinutes();
      if (startMinutes < minStartMinutes) throw new BadRequestException('Minimum advance notice not met');
    }

    // Validar que cae dentro de horarios
    const dayOfWeek = getWeekday0Sunday(date);
    await this.publicRepository.assertWithinSchedules({ negocioId: negocio.id, employeeId, dayOfWeek, startMinutes, endMinutes });

    // Crear cita con lock transaccional + revalidación de conflicto
    const cita = await this.publicRepository.createBookingTx({
      negocioId: negocio.id,
      employeeId,
      date,
      startMinutes,
      endMinutes,
      client,
      notes,
      services,
      totalPrice,
    });

    const emailResult = await this.emailService.sendBookingConfirmationEmail({
      negocio,
      cita: {
        ...cita,
        nombre_cliente: client.name,
      },
      toEmail: client.email || null,
    });

    return { cita, email: emailResult };
  }

  async getAvailability(slug, date, serviceIds, employeeId) {
    console.log('🔄 PublicService usando nuevo AvailabilityService:', { slug, date, serviceIds, employeeId });
    
    // Usar el nuevo sistema optimizado con soporte multi-empleado
    return await this.availabilityService.getSlots({
      slug,
      date,
      serviceIds,
      employeeId,
      slotMinutes: 15 // Slots de 15 minutos
    });
  }

  async confirmBooking(token) {
    const result = await this.publicRepository.confirmBookingByToken(token);
    if (!result) throw new NotFoundException('Invalid token');
    
    if (result.alreadyConfirmed) {
      return { 
        message: 'Esta cita ya ha sido confirmada anteriormente.',
        alreadyConfirmed: true,
        booking: result
      };
    }
    
    return { 
      message: 'Cita confirmada correctamente.',
      booking: result
    };
  }

  async resendConfirmation(email, name, date, startTime) {
    try {
      console.log('Resend confirmation request:', { email, name, date, startTime });
      
      // Find pending booking with matching details using repository
      const booking = await this.publicRepository.findPendingBooking(email, date, startTime);
      console.log('Found booking:', booking);

      if (!booking) {
        throw new NotFoundException('No se encontró ninguna reserva pendiente con esos datos');
      }

      // Use negocio info from booking if available, otherwise fetch it
      let negocio = {
        nombre: booking.negocio_nombre,
        slug: booking.negocio_slug
      };
      
      if (!negocio.nombre || !negocio.slug) {
        negocio = await this.publicRepository.getNegocioById(booking.negocio_id);
        console.log('Fetched negocio:', negocio);
      }
      
      if (!negocio) {
        throw new NotFoundException('Negocio no encontrado');
      }
      
      // Resend confirmation email - skip logging for now
      const emailResult = await this.emailService.sendBookingConfirmationEmail({
        negocio: {
          nombre: negocio.nombre,
          slug: negocio.slug
        },
        cita: {
          ...booking,
          nombre_cliente: name
        },
        toEmail: email,
      }, { skipLogging: true }); // Add option to skip logging

      return { 
        message: 'Email de confirmación reenviado correctamente.',
        email: emailResult 
      };
    } catch (error) {
      console.error('Error in resendConfirmation:', error);
      throw error;
    }
  }
}

Injectable()(PublicService);
Inject(PublicRepository)(PublicService, undefined, 0);
Inject(EmailService)(PublicService, undefined, 1);
Inject(AvailabilityService)(PublicService, undefined, 2);

module.exports = { PublicService };
