import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  People, 
  Plus, 
  Pencil, 
  Trash, 
  Eye, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ToggleOn,
  ToggleOff
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function AdministradoresPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'admin'
  });

  useEffect(() => {
    loadAdministradores();
  }, [currentPage, filterActivo]);

  const loadAdministradores = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filterActivo !== '' && { activo: filterActivo === 'true' })
      };
      
      const response = await adminApi.getAdministradores(user.token, params);
      setAdministradores(response.data);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (err) {
      setError('Error al cargar administradores');
      console.error('Load admins error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingAdmin) {
        await adminApi.updateAdministrador(user.token, editingAdmin.id, formData);
      } else {
        await adminApi.createAdministrador(user.token, formData);
      }
      
      setShowModal(false);
      resetForm();
      loadAdministradores();
    } catch (err) {
      setError(err.message || 'Error al guardar administrador');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      nombre: admin.nombre,
      email: admin.email,
      password: '',
      telefono: admin.telefono || '',
      rol: admin.rol
    });
    setShowModal(true);
  };

  const handleDeactivate = async (adminId) => {
    if (!window.confirm('¿Estás seguro de desactivar este administrador?')) return;

    try {
      await adminApi.deactivateAdministrador(user.token, adminId);
      loadAdministradores();
    } catch (err) {
      setError('Error al desactivar administrador');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'admin'
    });
    setEditingAdmin(null);
  };

  const filteredAdmins = administradores.filter(admin =>
    admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" size="lg" className="mb-3" style={{ color: 'white' }} />
          <p className="text-white">Cargando administradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at 20% 20%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
        linear-gradient(180deg, #1a1c2e 0%, #2d3748 100%)
      `,
      position: 'relative'
    }}>
      <Container className="position-relative" style={{ zIndex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="text-white fw-bold mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>
                  Administradores
                </h1>
                <p className="text-white-50 mb-0">
                  Gestión de administradores del sistema • {total} total
                </p>
              </div>
              <Button 
                variant="primary" 
                onClick={openModal}
                className="d-flex align-items-center"
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <Plus className="me-2" />
                Nuevo Administrador
              </Button>
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col md={4}>
            <div className="position-relative">
              <Search className="position-absolute" style={{ left: '15px', top: '14px', color: '#9ca3af' }} size={18} />
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '45px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid #e5e7eb',
                  background: 'rgba(255, 255, 255, 0.95)'
                }}
              />
            </div>
          </Col>
          <Col md={3}>
            <Form.Select
              value={filterActivo}
              onChange={(e) => setFilterActivo(e.target.value)}
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid #e5e7eb',
                background: 'rgba(255, 255, 255, 0.95)'
              }}
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </Form.Select>
          </Col>
          <Col md={5} className="text-end">
            <Button variant="outline-light" onClick={() => navigate('/superadmin')}>
              ← Volver al Dashboard
            </Button>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Administradores Table */}
        <Row>
          <Col>
            <Card className="border-0 animate-fade-in-up" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
            }}>
              <Card.Body className="p-0">
                <div style={{ overflowX: 'auto' }}>
                  <table className="table table-hover mb-0" style={{ background: 'transparent' }}>
                    <thead>
                      <tr>
                        <th style={{ color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Administrador</th>
                        <th style={{ color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Email</th>
                        <th style={{ color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Teléfono</th>
                        <th style={{ color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Rol</th>
                        <th style={{ color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Estado</th>
                        <th style={{ color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Creado</th>
                        <th style={{ color: '#4a5568', fontWeight: 600, borderBottom: '2px solid #e2e8f0' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map((admin, index) => (
                        <tr key={admin.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center justify-content-center me-3" style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: admin.rol === 'superadmin' ? 'linear-gradient(135deg, #f56565, #ed8936)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.9rem'
                              }}>
                                {admin.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="mb-0 fw-medium" style={{ color: '#2d3748' }}>
                                  {admin.nombre}
                                </p>
                                <small className="text-muted">ID: {admin.id.substring(0, 8)}...</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="mb-0" style={{ color: '#4a5568' }}>{admin.email}</p>
                          </td>
                          <td>
                            <p className="mb-0" style={{ color: '#4a5568' }}>
                              {admin.telefono || 'No registrado'}
                            </p>
                          </td>
                          <td>
                            <Badge bg={admin.rol === 'superadmin' ? 'danger' : 'primary'}>
                              {admin.rol === 'superadmin' ? 'Superadmin' : 'Admin'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {admin.activo ? (
                                <>
                                  <ToggleOn className="text-success me-2" size={20} />
                                  <Badge bg="success">Activo</Badge>
                                </>
                              ) : (
                                <>
                                  <ToggleOff className="text-muted me-2" size={20} />
                                  <Badge bg="secondary">Inactivo</Badge>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <small style={{ color: '#718096' }}>
                              {new Date(admin.created_at).toLocaleDateString('es-ES')}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEdit(admin)}
                                style={{ borderRadius: 'var(--radius-sm)' }}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeactivate(admin.id)}
                                disabled={admin.rol === 'superadmin' && admin.id === user.id}
                                style={{ borderRadius: 'var(--radius-sm)' }}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top">
                    <div className="text-muted">
                      Mostrando {filteredAdmins.length} de {total} administradores
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <span className="d-flex align-items-center px-3">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline-secondary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        style={{ borderRadius: 'var(--radius-sm)' }}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Create/Edit Modal */}
        <Modal show={showModal} onHide={closeModal} centered>
          <Modal.Header closeButton style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
          }}>
            <Modal.Title className="text-white">
              {editingAdmin ? 'Editar Administrador' : 'Nuevo Administrador'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'rgba(255, 255, 255, 0.98)' }}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">
                      Contraseña {editingAdmin && '(dejar en blanco para mantener)'}
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingAdmin}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Teléfono</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Rol</Form.Label>
                    <Form.Select
                      value={formData.rol}
                      onChange={(e) => setFormData({...formData, rol: e.target.value})}
                      disabled={user?.rol !== 'superadmin'}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <option value="admin">Administrador</option>
                      {user?.rol === 'superadmin' && (
                        <option value="superadmin">Superadministrador</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none'
                }}>
                  {editingAdmin ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        :root {
          --radius-sm: 8px;
          --radius-lg: 12px;
          --radius-xl: 16px;
          --font-display: 'Inter', system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
}

export default AdministradoresPage;
