import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Table, Modal, Form, Spinner, Badge, Alert, Row, Col } from 'react-bootstrap';
import { Plus, Pencil, Trash, ArrowLeft } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function AdminServices() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    negocioId: '',
    nombre: '',
    descripcion: '',
    duracion_minutos: 30,
    precio: '',
    activo: true,
  });

  const loadServices = async () => {
    try {
      // First load admin negocios to get negocioId
      const negociosData = await adminApi.getMyNegocios(user.token);
      
      if (negociosData.length > 0) {
        const negocioId = negociosData[0].id;
        setFormData(prev => ({ ...prev, negocioId }));
        
        // Now load services with negocioId
        const data = await adminApi.getServices(user.token, { negocioId });
        setServices(data);
      } else {
        setError('No tienes negocios asignados');
      }
    } catch (err) {
      setError('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) {
        await adminApi.updateService(user.token, editing.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          duracion_minutos: parseInt(formData.duracion_minutos),
          precio: parseFloat(formData.precio),
          activo: formData.activo,
        });
      } else {
        await adminApi.createService(user.token, {
          negocioId: formData.negocioId,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          duracion_minutos: parseInt(formData.duracion_minutos),
          precio: parseFloat(formData.precio),
          activo: formData.activo,
        });
      }
      setShowModal(false);
      setEditing(null);
      resetForm();
      loadServices();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este servicio?')) return;
    try {
      await adminApi.deleteService(user.token, id);
      loadServices();
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const handleEdit = (service) => {
    setEditing(service);
    setFormData({
      negocioId: service.negocio_id,
      nombre: service.nombre,
      descripcion: service.descripcion || '',
      duracion_minutos: service.duracion_minutos,
      precio: service.precio,
      activo: service.activo,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      negocioId: formData.negocioId,
      nombre: '',
      descripcion: '',
      duracion_minutos: 30,
      precio: '',
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
          <h2 className="fw-bold mb-0">Servicios</h2>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}>
          <Plus className="me-2" /> Nuevo servicio
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Duración</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <strong>{service.nombre}</strong>
                    {service.descripcion && (
                      <div className="text-muted small">{service.descripcion}</div>
                    )}
                  </td>
                  <td>{service.duracion_minutos} min</td>
                  <td>{parseFloat(service.precio).toFixed(2)}€</td>
                  <td>
                    <Badge bg={service.activo ? 'success' : 'secondary'}>
                      {service.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(service)}>
                      <Pencil />
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(service.id)}>
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {services.length === 0 && (
            <p className="text-muted text-center py-4">No hay servicios registrados</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Editar servicio' : 'Nuevo servicio'}</Modal.Title>
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
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </Form.Group>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Duración (min) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duracion_minutos}
                    onChange={(e) => setFormData({...formData, duracion_minutos: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Precio (€) *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
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
    </Container>
  );
}

export default AdminServices;
