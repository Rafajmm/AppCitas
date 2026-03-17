const { BadRequestException, NotFoundException } = require('@nestjs/common');
const { Inject } = require('@nestjs/common');
const { BusinessSchedulesRepository } = require('./business-schedules.repository');

class BusinessSchedulesService {
  constructor(businessSchedulesRepository) {
    this.businessSchedulesRepository = businessSchedulesRepository;
  }

  async getBusinessSchedules(adminId, negocioId) {
    // Verify admin owns the business
    const negocio = await this.businessSchedulesRepository.getNegocioById(negocioId);
    if (!negocio || negocio.id_admin !== adminId) {
      throw new NotFoundException('Business not found or access denied');
    }

    return await this.businessSchedulesRepository.getBusinessSchedules(negocioId);
  }

  async updateBusinessSchedules(adminId, negocioId, schedules) {
    // Verify admin owns the business
    const negocio = await this.businessSchedulesRepository.getNegocioById(negocioId);
    if (!negocio || negocio.id_admin !== adminId) {
      throw new NotFoundException('Business not found or access denied');
    }

    // Validate schedules
    for (const schedule of schedules) {
      if (schedule.hora_apertura >= schedule.hora_cierre) {
        throw new BadRequestException('Opening time must be before closing time');
      }
    }

    return await this.businessSchedulesRepository.updateBusinessSchedules(negocioId, schedules);
  }
}

module.exports = { BusinessSchedulesService };
