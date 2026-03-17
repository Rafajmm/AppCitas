const { Inject, Injectable, NotFoundException, BadRequestException } = require('@nestjs/common');
const { AvailabilityRepository } = require('./availability.repository');

const { timeToMinutes, minutesToTime, getWeekday0Sunday, intersectRanges, subtractRanges, clampRange } = require('./availability.utils');

class AvailabilityService {
  constructor(availabilityRepository) {
    this.availabilityRepository = availabilityRepository;
  }

  async getSlots({ slug, date, serviceIds, employeeId, slotMinutes }) {
    const negocio = await this.availabilityRepository.getNegocioBySlug(slug);
    if (!negocio) throw new NotFoundException('Negocio not found');
    if (!negocio.activo || !negocio.reservas_habilitadas) {
      return { negocioId: negocio.id, date, slots: [] };
    }

    const services = await this.availabilityRepository.getServicesByIds(negocio.id, serviceIds);
    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Some services do not belong to this negocio or are inactive');
    }

    const totalDurationMinutes = services.reduce((acc, s) => acc + Number(s.duracion_minutos), 0);
    if (totalDurationMinutes <= 0) throw new BadRequestException('Invalid total duration');

    const dayOfWeek = getWeekday0Sunday(date);

    const negocioSchedule = await this.availabilityRepository.getNegocioScheduleForDay(negocio.id, dayOfWeek);
    if (!negocioSchedule) {
      return { negocioId: negocio.id, date, slots: [] };
    }

    let baseOpen = timeToMinutes(negocioSchedule.hora_apertura);
    let baseClose = timeToMinutes(negocioSchedule.hora_cierre);

    const nowUtc = new Date();
    const minStartUtc = new Date(nowUtc.getTime() + Number(negocio.antelacion_minima_horas) * 60 * 60 * 1000);
    const requestedDay = new Date(date + 'T00:00:00.000Z');

    if (requestedDay.toISOString().slice(0, 10) === nowUtc.toISOString().slice(0, 10)) {
      const minStartMinutes = minStartUtc.getUTCHours() * 60 + minStartUtc.getUTCMinutes();
      baseOpen = Math.max(baseOpen, minStartMinutes);
    }

    if (employeeId) {
      const empSchedule = await this.availabilityRepository.getEmpleadoScheduleForDay(employeeId, dayOfWeek);
      if (!empSchedule) {
        return { negocioId: negocio.id, date, slots: [] };
      }

      const empOpen = timeToMinutes(empSchedule.hora_apertura);
      const empClose = timeToMinutes(empSchedule.hora_cierre);
      const [iOpen, iClose] = intersectRanges([[baseOpen, baseClose]], [[empOpen, empClose]]);
      if (!iOpen) return { negocioId: negocio.id, date, slots: [] };
      baseOpen = iOpen;
      baseClose = iClose;

      const busyIntervals = await this.availabilityRepository.getBusyIntervals({
        negocioId: negocio.id,
        date,
        employeeId,
      });

      const availableRanges = subtractRanges([[baseOpen, baseClose]], busyIntervals);

      const slots = [];
      const latestStart = baseClose - totalDurationMinutes;
      if (latestStart >= baseOpen) {
        for (const [start, end] of availableRanges) {
          const range = clampRange([start, end], [baseOpen, baseClose]);
          if (!range) continue;
          let t = range[0];

          if (slotMinutes > 1) {
            t = Math.ceil(t / slotMinutes) * slotMinutes;
          }

          while (t <= latestStart && t + totalDurationMinutes <= range[1]) {
            slots.push({
              start: minutesToTime(t),
              end: minutesToTime(t + totalDurationMinutes),
              durationMinutes: totalDurationMinutes,
            });
            t += slotMinutes;
          }
        }
      }

      return {
        negocioId: negocio.id,
        date,
        durationMinutes: totalDurationMinutes,
        slots,
      };
    }

    const employees = await this.availabilityRepository.getEmployeesForServices(negocio.id, serviceIds);
    if (employees.length === 0) {
      return { negocioId: negocio.id, date, slots: [] };
    }

    const employeeSlots = new Map();
    const latestStartGlobal = baseClose - totalDurationMinutes;
    if (latestStartGlobal < baseOpen) return { negocioId: negocio.id, date, slots: [] };

    for (const emp of employees) {
      const empSchedule = await this.availabilityRepository.getEmpleadoScheduleForDay(emp.id, dayOfWeek);
      if (!empSchedule) continue;

      const empOpen = timeToMinutes(empSchedule.hora_apertura);
      const empClose = timeToMinutes(empSchedule.hora_cierre);
      const [iOpen, iClose] = intersectRanges([[baseOpen, baseClose]], [[empOpen, empClose]]);
      if (!iOpen) continue;

      const busyIntervals = await this.availabilityRepository.getBusyIntervals({
        negocioId: negocio.id,
        date,
        employeeId: emp.id,
      });

      const availableRanges = subtractRanges([[iOpen, iClose]], busyIntervals);

      for (const [start, end] of availableRanges) {
        const range = clampRange([start, end], [iOpen, iClose]);
        if (!range) continue;
        let t = range[0];

        if (slotMinutes > 1) {
          t = Math.ceil(t / slotMinutes) * slotMinutes;
        }

        while (t <= latestStartGlobal && t + totalDurationMinutes <= range[1]) {
          const slotKey = minutesToTime(t);
          if (!employeeSlots.has(slotKey)) {
            employeeSlots.set(slotKey, {
              start: minutesToTime(t),
              end: minutesToTime(t + totalDurationMinutes),
              durationMinutes: totalDurationMinutes,
              availableEmployees: [],
            });
          }
          employeeSlots.get(slotKey).availableEmployees.push({
            id: emp.id,
            nombre: emp.nombre,
          });
          t += slotMinutes;
        }
      }
    }

    const slots = Array.from(employeeSlots.values())
      .filter(slot => slot.availableEmployees.length > 0)
      .sort((a, b) => a.start.localeCompare(b.start));

    return {
      negocioId: negocio.id,
      date,
      durationMinutes: totalDurationMinutes,
      slots,
    };
  }
}

Injectable()(AvailabilityService);
// Inject AvailabilityRepository into first constructor param
Inject(AvailabilityRepository)(AvailabilityService, undefined, 0);

module.exports = { AvailabilityService };
