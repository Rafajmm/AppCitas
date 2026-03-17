import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Table, Modal, Form, Spinner, Badge, Alert, ListGroup, Row, Col } from 'react-bootstrap';
import { Plus, Pencil, Trash, ArrowLeft, CheckCircle, XCircle } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function AdminEmployees() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [employeeServices, setEmployeeServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    negocioId: '',
    nombre: '',
    email: '',
    telefono: '',
    foto_url: '',
    activo: true,
  });

  const loadData = async () => {
    try {
      // First load admin negocios to get negocioId
      const negociosData = await adminApi.getMyNegocios(user.token);
      
      if (negociosData.length > 0) {
        const negocioId = negociosData[0].id;
        setFormData(prev => ({ ...prev, negocioId }));
        
        // Now load employees and services with negocioId
        const [empData, svcData] = await Promise.all([
          adminApi.getEmployees(user.token),
          adminApi.getServices(user.token, { negocioId }),
        ]);
        setEmployees(empData);
        setServices(svcData);
      } else {
        setError('No tienes negocios asignados');
      }
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.token]);

  const loadEmployeeServices = async (employeeId) => {
    try {
      const data = await adminApi.getEmployeeServices(user.token, employeeId);
      setEmployeeServices(data);
    } catch (err) {
      setError('Error al cargar servicios del empleado');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) {
        await adminApi.updateEmployee(user.token, editing.id, {
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          foto_url: formData.foto_url,
          activo: formData.activo,
        });
      } else {
        await adminApi.createEmployee(user.token, {
          negocioId: formData.negocioId,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          foto_url: formData.foto_url,
          activo: formData.activo,
        });
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    try {
      await adminApi.deleteEmployee(user.token, id);
      loadData();
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const handleAssignService = async (serviceId) => {
    try {
      await adminApi.assignService(user.token, {
        empleadoId: selectedEmployee.id,
        servicioId: serviceId,
      });
      loadEmployeeServices(selectedEmployee.id);
    } catch (err) {
      setError('Error al asignar servicio');
    }
  };

  const handleUnassignService = async (serviceId) => {
    try {
      await adminApi.unassignService(user.token, selectedEmployee.id, serviceId);
      loadEmployeeServices(selectedEmployee.id);
    } catch (err) {
      setError('Error al desasignar servicio');
    }
  };

  const openServicesModal = (employee) => {
    setSelectedEmployee(employee);
    loadEmployeeServices(employee.id);
    setShowServicesModal(true);
  };

  const handleEdit = (employee) => {
    setEditing(employee);
    setFormData({
      negocioId: employee.negocio_id,
      nombre: employee.nombre,
      email: employee.email || '',
      telefono: employee.telefono || '',
      foto_url: employee.foto_url || '',
      activo: employee.activo,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      negocioId: formData.negocioId,
      nombre: '',
      email: '',
      telefono: '',
      foto_url: '',
      activo: true,
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" className="me-3" as={Link} to="/admin">
            <ArrowLeft />
          </Button>
          <h2 className="fw-bold mb-0">Empleados</h2>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}>
          <Plus className="me-2" /> Nuevo empleado
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Servicios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <strong>{employee.nombre}</strong>
                  </td>
                  <td>
                    {employee.email && <div className="small">{employee.email}</div>}
                    {employee.telefono && <div className="small text-muted">{employee.telefono}</div>}
                  </td>
                  <td>
                    <Badge bg={employee.activo ? 'success' : 'secondary'}>
                      {employee.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-info" size="sm" onClick={() => openServicesModal(employee)}>
                      Gestionar
                    </Button>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(employee)}>
                      <Pencil />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(employee.id)}>
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {employees.length === 0 && (
            <p className="text-muted text-center py-4">No hay empleados registrados</p>
          )}
        </Card.Body>
      </Card>

      {/* Employee Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Editar empleado' : 'Nuevo empleado'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                label="Activo"
                checked={formData.activo}
                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Guardar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Services Modal */}
      <Modal show={showServicesModal} onHide={() => setShowServicesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Servicios de {selectedEmployee?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6>Servicios asignados</h6>
              <ListGroup>
                {employeeServices.map((es) => (
                  <ListGroup.Item key={es.servicio_id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{es.servicio_nombre}</strong>
                      <div className="text-muted small">{es.duracion_minutos} min - {parseFloat(es.precio).toFixed(2)}€</div>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={() => handleUnassignService(es.servicio_id)}>
                      <XCircle />
                    </Button>
                  </ListGroup.Item>
                ))}
                {employeeServices.length === 0 && (
                  <ListGroup.Item className="text-muted">No tiene servicios asignados</ListGroup.Item>
                )}
              </ListGroup>
            </Col>
            <Col md={6}>
              <h6>Servicios disponibles</h6>
              <ListGroup>
                {services
                  .filter(s => s.activo && !employeeServices.find(es => es.servicio_id === s.id))
                  .map((service) => (
                    <ListGroup.Item key={service.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{service.nombre}</strong>
                        <div className="text-muted small">{service.duracion_minutos} min - {parseFloat(service.precio).toFixed(2)}€</div>
                      </div>
                      <Button variant="outline-success" size="sm" onClick={() => handleAssignService(service.id)}>
                        <CheckCircle />
                      </Button>
                    </ListGroup.Item>
                  ))}
                {services.filter(s => s.activo && !employeeServices.find(es => es.servicio_id === s.id)).length === 0 && (
                  <ListGroup.Item className="text-muted">No hay más servicios disponibles</ListGroup.Item>
                )}
              </ListGroup>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default AdminEmployees;
