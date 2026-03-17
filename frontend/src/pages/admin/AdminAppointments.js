import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Table, Badge, Alert, Form, Row, Col, Modal } from 'react-bootstrap';
import { ArrowLeft, CheckCircle, XCircle, CheckAll, PersonX, Funnel } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function AdminAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadAppointments = async (queryParams = {}) => {
    setLoading(true);
    try {
      const data = await adminApi.getAppointments(user.token, queryParams);
      setAppointments(data);
    } catch (err) {
      setError('Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user?.token]);

  const handleFilter = () => {
    const params = {};
    if (filters.estado) params.estado = filters.estado;
    if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde;
    if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta;
    loadAppointments(params);
  };

  const handleClearFilters = () => {
    setFilters({ estado: '', fechaDesde: '', fechaHasta: '' });
    loadAppointments();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminApi.updateAppointmentStatus(user.token, id, newStatus);
      loadAppointments(filters.estado || filters.fechaDesde || filters.fechaHasta ? filters : {});
    } catch (err) {
      setError('Error al actualizar estado');
    }
  };

  const openDetail = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const getStatusBadge = (estado) => {
    const variants = {
      pendiente: 'warning',
      confirmada: 'success',
      cancelada: 'danger',
      completada: 'primary',
      no_show: 'secondary',
    };
    return <Badge bg={variants[estado] || 'secondary'}>{estado}</Badge>;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" className="me-3" as={Link} to="/admin">
            <ArrowLeft />
          </Button>
          <h2 className="fw-bold mb-0">Gestión de Citas</h2>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => setShowFilters(!showFilters)}
          active={showFilters}
        >
          <Funnel className="me-2" /> Filtros
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* Filters */}
      {showFilters && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={filters.estado}
                    onChange={(e) => setFilters({...filters, estado: e.target.value})}
                  >
                    <option value="">Todos</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="no_show">No Show</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.fechaDesde}
                    onChange={(e) => setFilters({...filters, fechaDesde: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Fecha hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.fechaHasta}
                    onChange={(e) => setFilters({...filters, fechaHasta: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <div>
                  <Button variant="primary" className="me-2" onClick={handleFilter}>
                    Aplicar
                  </Button>
                  <Button variant="outline-secondary" onClick={handleClearFilters}>
                    Limpiar
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Fecha/Hora</th>
                  <th>Servicios</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="cursor-pointer" onClick={() => openDetail(apt)}>
                    <td>
                      <strong>{apt.nombre_cliente}</strong>
                      <div className="text-muted small">{apt.email_cliente}</div>
                      {apt.telefono_cliente && <div className="text-muted small">{apt.telefono_cliente}</div>}
                    </td>
                    <td>
                      <div>{formatDate(apt.fecha)}</div>
                      <div className="text-muted small">{apt.hora_inicio?.substring(0, 5)} - {apt.hora_fin?.substring(0, 5)}</div>
                    </td>
                    <td>
                      {Array.isArray(apt.servicios) && apt.servicios.slice(0, 2).map((s, i) => (
                        <div key={i} className="small">{s.nombre_servicio}</div>
                      ))}
                      {Array.isArray(apt.servicios) && apt.servicios.length > 2 && (
                        <div className="text-muted small">+{apt.servicios.length - 2} más</div>
                      )}
                    </td>
                    <td className="fw-bold">{parseFloat(apt.precio_total).toFixed(2)}€</td>
                    <td>{getStatusBadge(apt.estado)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {apt.estado === 'pendiente' && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-1"
                          onClick={() => handleStatusChange(apt.id, 'confirmada')}
                          title="Confirmar"
                        >
                          <CheckCircle />
                        </Button>
                      )}
                      {apt.estado === 'confirmada' && (
                        <>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1"
                            onClick={() => handleStatusChange(apt.id, 'completada')}
                            title="Completar"
                          >
                            <CheckAll />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="me-1"
                            onClick={() => handleStatusChange(apt.id, 'cancelada')}
                            title="Cancelar"
                          >
                            <XCircle />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleStatusChange(apt.id, 'no_show')}
                            title="No Show"
                          >
                            <PersonX />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {appointments.length === 0 && !loading && (
            <p className="text-muted text-center py-4">No hay citas que mostrar</p>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
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
                  <p className="mb-1">{new Date(selectedAppointment.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="mb-1 text-muted">{selectedAppointment.hora_inicio?.substring(0, 5)} - {selectedAppointment.hora_fin?.substring(0, 5)}</p>
                  <div className="mt-2">{getStatusBadge(selectedAppointment.estado)}</div>
                </Col>
              </Row>
              
              <h6>Servicios</h6>
              <ul className="list-group mb-3">
                {Array.isArray(selectedAppointment.servicios) && selectedAppointment.servicios.map((s, i) => (
                  <li key={i} className="list-group-item d-flex justify-content-between">
                    <span>{s.nombre_servicio} ({s.duracion_minutos} min)</span>
                    <span className="fw-bold">{parseFloat(s.precio_servicio).toFixed(2)}€</span>
                  </li>
                ))}
              </ul>
              
              <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                <span className="fw-bold">Total:</span>
                <span className="fw-bold fs-4">{parseFloat(selectedAppointment.precio_total).toFixed(2)}€</span>
              </div>
              
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
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AdminAppointments;
