import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  Building, 
  Plus, 
  Pencil, 
  Trash, 
  Eye, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ToggleOn,
  ToggleOff,
  Palette,
  Globe,
  Phone,
  People
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function NegociosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [negocios, setNegocios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNegocio, setEditingNegocio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    color_primario: '#3B82F6',
    color_secundario: '#10B981',
    color_acento: '#c0cc11',
    whatsapp: '',
    web_url: '',
    reservas_habilitadas: true,
    antelacion_minima_horas: 2,
    tiempo_confirmacion_minutos: 30,
    administrador_id: '' // Changed to single admin
  });

  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [negocioAdmins, setNegocioAdmins] = useState([]);

  useEffect(() => {
    loadNegocios();
    loadAvailableAdmins();
  }, [currentPage, filterActivo]);

  // Update form when negocioAdmins are loaded (for editing)
  useEffect(() => {
    if (editingNegocio && negocioAdmins.length > 0) {
      const adminId = negocioAdmins[0].id; // Take first admin
      setFormData(prev => ({
        ...prev,
        administrador_id: adminId
      }));
    }
  }, [negocioAdmins, editingNegocio]);

  const loadAvailableAdmins = async () => {
    try {
      const response = await adminApi.getAdministradores(user.token, { activo: true });
      setAvailableAdmins(response.data.filter(admin => admin.rol === 'admin'));
    } catch (err) {
      console.error('Error loading admins:', err);
    }
  };

  const loadNegocioAdmins = async (negocioId) => {
    try {
      const response = await adminApi.getAdminsByNegocio(user.token, negocioId);
      setNegocioAdmins(response.data || []);
    } catch (err) {
      console.error('Error loading negocio admins:', err);
      setNegocioAdmins([]);
    }
  };

  const loadNegocios = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(filterActivo !== '' && { activo: filterActivo === 'true' })
      };
      
      const response = await adminApi.getSuperadminNegocios(user.token, params);
      setNegocios(response.data);
      setTotal(response.total);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (err) {
      setError('Error al cargar negocios');
      console.error('Load negocios error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Create or update negocio first
      const negocio = editingNegocio 
        ? await adminApi.updateSuperadminNegocio(user.token, editingNegocio.id, formData)
        : await adminApi.createSuperadminNegocio(user.token, formData);
      
      // Handle admin assignment for both create and update
      if (formData.administrador_id) {
        await adminApi.asignarAdmins(user.token, negocio.id, { 
          administrador_ids: [formData.administrador_id] 
        });
      }
      
      setShowModal(false);
      resetForm();
      loadNegocios();
    } catch (err) {
      setError(err.message || 'Error al guardar negocio');
    }
  };

  const handleEdit = async (negocio) => {
    setEditingNegocio(negocio);
    
    // Load current admins assigned to this negocio
    await loadNegocioAdmins(negocio.id);
    
    setFormData({
      nombre: negocio.nombre,
      slug: negocio.slug,
      descripcion: negocio.descripcion || '',
      direccion: negocio.direccion || '',
      telefono: negocio.telefono || '',
      email: negocio.email || '',
      color_primario: negocio.color_primario || '#3B82F6',
      color_secundario: negocio.color_secundario || '#10B981',
      color_acento: negocio.color_acento || '#c0cc11',
      whatsapp: negocio.whatsapp || '',
      web_url: negocio.web_url || '',
      reservas_habilitadas: negocio.reservas_habilitadas !== false,
      antelacion_minima_horas: negocio.antelacion_minima_horas || 2,
      tiempo_confirmacion_minutos: negocio.tiempo_confirmacion_minutos || 30,
      administrador_id: '' // Will be populated after loading
    });
    setShowModal(true);
  };

  const handleDeactivate = async (negocioId) => {
    if (!window.confirm('¿Estás seguro de desactivar este negocio?')) return;

    try {
      await adminApi.deactivateSuperadminNegocio(user.token, negocioId);
      loadNegocios();
    } catch (err) {
      setError('Error al desactivar negocio');
    }
  };

  const handleViewStats = (negocioId) => {
    navigate(`/superadmin/negocios/${negocioId}/estadisticas`);
  };

  const handleViewAdmins = (negocioId) => {
    navigate(`/superadmin/negocios/${negocioId}/admins`);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      slug: '',
      descripcion: '',
      direccion: '',
      telefono: '',
      email: '',
      color_primario: '#3B82F6',
      color_secundario: '#10B981',
      color_acento: '#c0cc11',
      whatsapp: '',
      web_url: '',
      reservas_habilitadas: true,
      antelacion_minima_horas: 2,
      tiempo_confirmacion_minutos: 30,
      administrador_id: '' // Changed to single admin
    });
    setEditingNegocio(null);
    setNegocioAdmins([]);
  };

  const filteredNegocios = negocios.filter(negocio =>
    negocio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    negocio.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    negocio.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-white">Cargando negocios...</p>
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
                  Negocios
                </h1>
                <p className="text-white-50 mb-0">
                  Gestión de negocios del sistema • {total} total
                </p>
              </div>
              <Button 
                variant="success" 
                onClick={openModal}
                className="d-flex align-items-center"
                style={{
                  background: 'linear-gradient(135deg, #48bb78, #38a169)',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <Plus className="me-2" />
                Nuevo Negocio
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
                placeholder="Buscar por nombre, slug o email..."
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

        {/* Negocios Cards */}
        <Row className="g-4">
          {filteredNegocios.map((negocio, index) => (
            <Col md={6} lg={4} key={negocio.id}>
              <Card className="border-0 h-100 animate-fade-in-up" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                animationDelay: `${index * 0.1}s`
              }}>
                <Card.Header className="bg-transparent border-0 pb-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex align-items-center">
                      <div 
                        className="d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 'var(--radius-lg)',
                          background: `linear-gradient(135deg, ${negocio.color_primario || '#3B82F6'}, ${negocio.color_secundario || '#10B981'})`,
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.2rem'
                        }}
                      >
                        {negocio.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: '#2d3748' }}>
                          {negocio.nombre}
                        </h5>
                        <small className="text-muted">/{negocio.slug}</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      {negocio.activo ? (
                        <Badge bg="success">Activo</Badge>
                      ) : (
                        <Badge bg="secondary">Inactivo</Badge>
                      )}
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="pt-2">
                  <div className="mb-3">
                    <p className="text-muted small mb-2">
                      {negocio.descripcion || 'Sin descripción'}
                    </p>
                    <div className="d-flex flex-wrap gap-2">
                      {negocio.email && (
                        <small className="text-muted">
                          <Globe size={12} className="me-1" />
                          {negocio.email}
                        </small>
                      )}
                      {negocio.telefono && (
                        <small className="text-muted">
                          <Phone size={12} className="me-1" />
                          {negocio.telefono}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="d-flex gap-2 mb-3">
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        backgroundColor: negocio.color_primario || '#3B82F6',
                        border: '1px solid #e2e8f0'
                      }} />
                      <small className="ms-1 text-muted">Primario</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        backgroundColor: negocio.color_secundario || '#10B981',
                        border: '1px solid #e2e8f0'
                      }} />
                      <small className="ms-1 text-muted">Secundario</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <div style={{
                        width: 20,
                        height: 20,
                        borderRadius: '4px',
                        backgroundColor: negocio.color_acento || '#c0cc11',
                        border: '1px solid #e2e8f0'
                      }} />
                      <small className="ms-1 text-muted">Acento</small>
                    </div>
                  </div>

                  {/* Settings Info */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Reservas:</small>
                      <Badge bg={negocio.reservas_habilitadas !== false ? 'success' : 'warning'} className="px-2 py-1">
                        {negocio.reservas_habilitadas !== false ? 'Habilitadas' : 'Deshabilitadas'}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Antelación:</small>
                      <small className="text-muted">{negocio.antelacion_minima_horas || 2}h</small>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">Confirmación:</small>
                      <small className="text-muted">{negocio.tiempo_confirmacion_minutos || 30}min</small>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(negocio)}
                      className="flex-fill"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <Pencil size={14} className="me-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewStats(negocio.id)}
                      className="flex-fill"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <Eye size={14} className="me-1" />
                      Estadísticas
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeactivate(negocio.id)}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        {totalPages > 1 && (
          <Row className="mt-4">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted">
                  Mostrando {filteredNegocios.length} de {total} negocios
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
            </Col>
          </Row>
        )}

        {/* Create/Edit Modal */}
        <Modal show={showModal} onHide={closeModal} centered size="lg">
          <Modal.Header closeButton style={{
            background: 'linear-gradient(135deg, #48bb78, #38a169)',
            border: 'none',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
          }}>
            <Modal.Title className="text-white">
              {editingNegocio ? 'Editar Negocio' : 'Nuevo Negocio'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'rgba(255, 255, 255, 0.98)', maxHeight: '70vh', overflowY: 'auto' }}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Nombre del Negocio</Form.Label>
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
                    <Form.Label className="fw-medium">Slug (URL)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                      required
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                    <small className="text-muted">Ej: mi-peluqueria</small>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  placeholder="Describe brevemente el negocio..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      placeholder="contacto@negocio.com"
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
                      placeholder="+34 900 000 000"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Dirección</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  style={{ borderRadius: 'var(--radius-sm)' }}
                  placeholder="Calle Principal 123, Ciudad"
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">WhatsApp</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Sitio Web</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.web_url}
                      onChange={(e) => setFormData({...formData, web_url: e.target.value})}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                      placeholder="https://www.ejemplo.es"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Reservas Habilitadas</Form.Label>
                    <Form.Select
                      value={formData.reservas_habilitadas}
                      onChange={(e) => setFormData({...formData, reservas_habilitadas: e.target.value === 'true'})}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      <option value={true}>Sí</option>
                      <option value={false}>No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Colors */}
              <div className="mb-3">
                <Form.Label className="fw-medium d-flex align-items-center">
                  <Palette className="me-2" />
                  Colores de Marca
                </Form.Label>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Color Primario</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="color"
                          value={formData.color_primario}
                          onChange={(e) => setFormData({...formData, color_primario: e.target.value})}
                          style={{ borderRadius: 'var(--radius-sm)', width: '60px' }}
                        />
                        <Form.Control
                          type="text"
                          value={formData.color_primario}
                          onChange={(e) => setFormData({...formData, color_primario: e.target.value})}
                          style={{ borderRadius: 'var(--radius-sm)' }}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Color Secundario</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="color"
                          value={formData.color_secundario}
                          onChange={(e) => setFormData({...formData, color_secundario: e.target.value})}
                          style={{ borderRadius: 'var(--radius-sm)', width: '60px' }}
                        />
                        <Form.Control
                          type="text"
                          value={formData.color_secundario}
                          onChange={(e) => setFormData({...formData, color_secundario: e.target.value})}
                          style={{ borderRadius: 'var(--radius-sm)' }}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Color Acento</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="color"
                          value={formData.color_acento}
                          onChange={(e) => setFormData({...formData, color_acento: e.target.value})}
                          style={{ borderRadius: 'var(--radius-sm)', width: '60px' }}
                        />
                        <Form.Control
                          type="text"
                          value={formData.color_acento}
                          onChange={(e) => setFormData({...formData, color_acento: e.target.value})}
                          style={{ borderRadius: 'var(--radius-sm)' }}
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Admin Assignment - Show for both create and edit */}
              <div className="mb-3">
                <Form.Label className="fw-medium d-flex align-items-center">
                  <People className="me-2" />
                  {editingNegocio ? 'Modificar Administrador Asignado' : 'Asignar Administrador'}
                </Form.Label>
                <Form.Group>
                  <Form.Select
                    value={formData.administrador_id}
                    onChange={(e) => {
                      setFormData({...formData, administrador_id: e.target.value});
                    }}
                    style={{ 
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <option value="">Selecciona un administrador</option>
                    {availableAdmins.map(admin => (
                      <option key={admin.id} value={admin.id}>
                        {admin.nombre} ({admin.email})
                      </option>
                    ))}
                  </Form.Select>
                  <small className="text-muted">
                    {editingNegocio 
                      ? 'Modifica el administrador asignado al negocio.'
                      : 'Selecciona un administrador para asignar al negocio. Cada negocio tiene un solo administrador.'
                    }
                  </small>
                </Form.Group>
              </div>

              {/* Settings */}
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Antelación Mínima (horas)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.antelacion_minima_horas}
                      onChange={(e) => setFormData({...formData, antelacion_minima_horas: parseInt(e.target.value)})}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Tiempo Confirmación (minutos)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      value={formData.tiempo_confirmacion_minutos}
                      onChange={(e) => setFormData({...formData, tiempo_confirmacion_minutos: parseInt(e.target.value)})}
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="outline-secondary" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" style={{
                  background: 'linear-gradient(135deg, #48bb78, #38a169)',
                  border: 'none'
                }}>
                  {editingNegocio ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
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

export default NegociosPage;
