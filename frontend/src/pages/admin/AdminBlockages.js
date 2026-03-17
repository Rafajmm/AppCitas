import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Table, Modal, Form, Spinner, Badge, Alert, Row, Col } from 'react-bootstrap';
import { Plus, Trash, ArrowLeft } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function AdminBlockages() {
  const { user } = useAuth();
  const [blockages, setBlockages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    negocioId: '',
    empleadoId: null,
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    titulo: '',
    descripcion: '',
  });

  const loadData = async () => {
    try {
      // First load admin negocios to get negocioId
      const negociosData = await adminApi.getMyNegocios(user.token);
      
      if (negociosData.length > 0) {
        const negocioId = negociosData[0].id;
        setFormData(prev => ({ ...prev, negocioId }));
        
        // Now load blockages and employees with negocioId
        const [blockData, empData] = await Promise.all([
          adminApi.getBlockages(user.token, { negocioId }),
          adminApi.getEmployees(user.token),
        ]);
        setBlockages(blockData.filter(b => b.activo));
        setEmployees(empData);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await adminApi.createBlockage(user.token, {
        ...formData,
        empleadoId: formData.empleadoId || null,
        hora_inicio: formData.hora_inicio || null,
        hora_fin: formData.hora_fin || null,
        activo: true,
      });
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || 'Error al crear bloqueo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este bloqueo?')) return;
    try {
      await adminApi.deleteBlockage(user.token, id);
      loadData();
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      negocioId: formData.negocioId,
      empleadoId: null,
      fecha_inicio: '',
      fecha_fin: '',
      hora_inicio: '',
      hora_fin: '',
      titulo: '',
      descripcion: '',
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES');
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
          <h2 className="fw-bold mb-0">Bloqueos de Agenda</h2>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="me-2" /> Nuevo bloqueo
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Título</th>
                <th>Período</th>
                <th>Horario</th>
                <th>Empleado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {blockages.map((blockage) => (
                <tr key={blockage.id}>
                  <td>
                    <strong>{blockage.titulo}</strong>
                    {blockage.descripcion && (
                      <div className="text-muted small">{blockage.descripcion}</div>
                    )}
                  </td>
                  <td>
                    {formatDate(blockage.fecha_inicio)} - {formatDate(blockage.fecha_fin)}
                  </td>
                  <td>
                    {blockage.hora_inicio ? (
                      `${blockage.hora_inicio.substring(0, 5)} - ${blockage.hora_fin.substring(0, 5)}`
                    ) : (
                      <Badge bg="info">Todo el día</Badge>
                    )}
                  </td>
                  <td>
                    {blockage.empleado_nombre || <Badge bg="secondary">Todo el negocio</Badge>}
                  </td>
                  <td>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(blockage.id)}>
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {blockages.length === 0 && (
            <p className="text-muted text-center py-4">No hay bloqueos registrados</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo bloqueo</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
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
                  <Form.Label>Fecha inicio *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha fin *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Hora inicio (opcional)</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Hora fin (opcional)</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Empleado afectado (opcional)</Form.Label>
              <Form.Select
                value={formData.empleadoId || ''}
                onChange={(e) => setFormData({...formData, empleadoId: e.target.value || null})}
              >
                <option value="">Todo el negocio</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Crear bloqueo
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminBlockages;
