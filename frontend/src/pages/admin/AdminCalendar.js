import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, ButtonGroup, Row, Col, Form, Alert, Modal, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'react-bootstrap-icons';
import DatePicker from 'react-datepicker';
import {
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function timeToMinutes(hhmmss) {
  if (!hhmmss) return null;
  const [hh, mm] = String(hhmmss).split(':');
  return Number(hh) * 60 + Number(mm);
}

function getStatusBadge(estado) {
  const variants = {
    pendiente: 'warning',
    confirmada: 'success',
    cancelada: 'danger',
    completada: 'primary',
    no_show: 'secondary',
  };
  return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
}


function AdminCalendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  
  const loadAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        fechaDesde: format(selectedDate, 'yyyy-MM-dd'),
        fechaHasta: format(selectedDate, 'yyyy-MM-dd'),
      };

      const data = await adminApi.getCalendarAppointments(user.token, params);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (!user?.token) return;
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token, selectedDate]);

  
  const openDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handlePrevMonth = () => setCurrentMonth((d) => subMonths(d, 1));
  const handleNextMonth = () => setCurrentMonth((d) => addMonths(d, 1));
  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const monthStartDay = useMemo(() => {
    return getDay(startOfMonth(currentMonth));
  }, [currentMonth]);

  
  const selectDay = (day) => {
    setSelectedDate(day);
  };

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <Button variant="outline-secondary" className="me-3" as={Link} to="/admin">
              <ArrowLeft />
            </Button>
            <div>
              <h2 className="fw-bold mb-0">Calendario de Citas</h2>
              <div className="text-muted small">{format(currentMonth, "MMMM yyyy", { locale: es })}</div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" onClick={handleToday}>
              Hoy
            </Button>
            <ButtonGroup>
              <Button variant="outline-secondary" onClick={handlePrevMonth}>
                <ChevronLeft />
              </Button>
              <Button variant="outline-secondary" onClick={handleNextMonth}>
                <ChevronRight />
              </Button>
            </ButtonGroup>
          </div>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">{format(currentMonth, "MMMM yyyy", { locale: es })}</h5>
                <div className="text-muted small">
                  Día seleccionado: <strong>{format(selectedDate, "d", { locale: es })}</strong>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered text-center">
                  <thead>
                    <tr>
                      <th>Dom</th>
                      <th>Lun</th>
                      <th>Mar</th>
                      <th>Mié</th>
                      <th>Jue</th>
                      <th>Vie</th>
                      <th>Sáb</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil((monthStartDay + monthDays.length) / 7) }).map((_, weekIdx) => (
                      <tr key={weekIdx}>
                        {Array.from({ length: 7 }).map((_, dayIdx) => {
                          const dayNumber = weekIdx * 7 + dayIdx - monthStartDay + 1;
                          const day = dayNumber > 0 && dayNumber <= monthDays.length ? monthDays[dayNumber - 1] : null;
                          const isSelected = day && isSameDay(day, selectedDate);
                          const isTodayDate = day && new Date().toDateString() === day.toDateString();
                          const hasAppointments = day && appointments.some((a) => isSameDay(parseISO(a.fecha), day));

                          return (
                            <td
                              key={dayIdx}
                              className={`p-2 ${isSelected ? 'bg-primary text-white' : ''} ${isTodayDate && !isSelected ? 'bg-light' : ''}`}
                              style={{
                                cursor: day ? 'pointer' : 'default',
                                verticalAlign: 'top',
                                height: '120px',
                                width: '14.28%',
                              }}
                              onClick={() => day && selectDay(day)}
                            >
                              <div className="mb-1">
                                <strong>{day ? format(day, 'd') : ''}</strong>
                                {hasAppointments && (
                                  <div className="mt-1">
                                    <Badge bg={isSelected ? 'light' : 'primary'} text={isSelected ? 'dark' : 'light'} size="sm">
                                      {appointments.filter((a) => isSameDay(parseISO(a.fecha), day)).length}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <hr className="my-4" />

            <div>
              <h5 className="fw-bold mb-3">
                Citas para {format(selectedDate, "EEEE d 'de' MMMM yyyy", { locale: es })}
              </h5>

              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <Spinner animation="border" role="status" />
                </div>
              ) : (
                <>
                  {appointments.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No hay citas para este día
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Servicios</th>
                            <th>Empleado</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((apt) => (
                            <tr key={apt.id}>
                              <td>
                                <div className="fw-semibold">
                                  {apt.hora_inicio?.substring(0, 5)} - {apt.hora_fin?.substring(0, 5)}
                                </div>
                              </td>
                              <td>
                                <div className="fw-semibold">{apt.nombre_cliente}</div>
                                <div className="text-muted small">{apt.email_cliente}</div>
                                {apt.telefono_cliente && (
                                  <div className="text-muted small">{apt.telefono_cliente}</div>
                                )}
                              </td>
                              <td>
                                {Array.isArray(apt.servicios) && apt.servicios.slice(0, 2).map((s, i) => (
                                  <div key={i} className="small">{s.nombre_servicio}</div>
                                ))}
                                {Array.isArray(apt.servicios) && apt.servicios.length > 2 && (
                                  <div className="text-muted small">+{apt.servicios.length - 2} más</div>
                                )}
                              </td>
                              <td>{apt.empleado_nombre || '-'}</td>
                              <td>{getStatusBadge(apt.estado)}</td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => openDetail(apt)}
                                >
                                  Ver
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card.Body>
        </Card>

        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Detalle de Cita</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedAppointment && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <h6>Cliente</h6>
                    <p className="mb-1"><strong>{selectedAppointment.nombre_cliente}</strong></p>
                    <p className="mb-1 text-muted">{selectedAppointment.email_cliente}</p>
                    {selectedAppointment.telefono_cliente && (
                      <p className="mb-1 text-muted">{selectedAppointment.telefono_cliente}</p>
                    )}
                  </Col>
                  <Col md={6}>
                    <h6>Fecha y Hora</h6>
                    <p className="mb-1">
                      {format(parseISO(selectedAppointment.fecha), "EEEE d MMMM yyyy", { locale: es })}
                    </p>
                    <p className="mb-1 text-muted">
                      {selectedAppointment.hora_inicio?.substring(0, 5)} - {selectedAppointment.hora_fin?.substring(0, 5)}
                    </p>
                    <div className="mt-2">{getStatusBadge(selectedAppointment.estado)}</div>
                  </Col>
                </Row>

                {selectedAppointment.empleado_nombre && (
                  <div className="mb-3">
                    <h6>Profesional</h6>
                    <div className="text-muted">{selectedAppointment.empleado_nombre}</div>
                  </div>
                )}

                <h6>Servicios</h6>
                {Array.isArray(selectedAppointment.servicios) && selectedAppointment.servicios.length > 0 ? (
                  <ul className="list-group mb-3">
                    {selectedAppointment.servicios.map((s, i) => (
                      <li key={i} className="list-group-item d-flex justify-content-between">
                        <span>{s.nombre_servicio} ({s.duracion_minutos} min)</span>
                        <span className="fw-bold">{parseFloat(s.precio_servicio).toFixed(2)}€</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted mb-3">Sin servicios</div>
                )}

                {selectedAppointment.notas_cliente && (
                  <div className="mt-3">
                    <h6>Notas del cliente</h6>
                    <p className="text-muted">{selectedAppointment.notas_cliente}</p>
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button as={Link} to="/admin/appointments" variant="outline-primary" onClick={() => setShowDetailModal(false)}>
              Ir a gestión
            </Button>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}

export default AdminCalendar;
