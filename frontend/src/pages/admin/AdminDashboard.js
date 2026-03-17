import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { 
  Shop, Calendar, People, Clock, Ban, BoxArrowRight, 
  ChevronRight, Palette, CheckCircle, ExclamationCircle, PlayCircle, XCircle
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';
import { SkeletonStats, SkeletonList } from '../../components/SkeletonLoader';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const appointments = await adminApi.getAppointments(user.token);
      
      setStats({
        appointments: appointments.length,
        pending: appointments.filter(a => a.estado === 'pendiente').length,
        confirmed: appointments.filter(a => a.estado === 'confirmada').length,
        completed: appointments.filter(a => a.estado === 'completada').length,
        cancelled: appointments.filter(a => a.estado === 'cancelada').length,
      });
      
      setRecentAppointments(appointments.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.token]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/appointments', icon: Calendar, label: 'Citas', color: '#3B82F6', bg: '#EBF5FF' },
    { path: '/admin/services', icon: Shop, label: 'Servicios', color: '#10B981', bg: '#ECFDF5' },
    { path: '/admin/employees', icon: People, label: 'Empleados', color: '#8B5CF6', bg: '#F5F3FF' },
    { path: '/admin/schedules', icon: Clock, label: 'Horarios', color: '#F59E0B', bg: '#FFFBEB' },
    { path: '/admin/blockages', icon: Ban, label: 'Bloqueos', color: '#EF4444', bg: '#FEF2F2' },
    { path: '/admin/settings', icon: Palette, label: 'Personalización', color: '#EC4899', bg: '#FDF2F8' },
  ];

  const getStatusBadge = (estado) => {
    const config = {
      confirmada: { bg: '#D1FAE5', color: '#059669', icon: CheckCircle },
      cancelada: { bg: '#FEE2E2', color: '#DC2626', icon: XCircle },
      completada: { bg: '#DBEAFE', color: '#2563EB', icon: PlayCircle },
      no_show: { bg: '#F3F4F6', color: '#6B7280', icon: ExclamationCircle },
    };
    const { bg, color, icon: Icon } = config[estado] || config.no_show;
    return (
      <span 
        className="d-inline-flex align-items-center px-2 py-1 rounded-pill"
        style={{ background: bg, color, fontSize: '0.75rem', fontWeight: 600 }}
      >
        <Icon size={12} className="me-1" />
        {estado}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-vh-100" style={{ background: '#f8fafc' }}>
        <Container className="py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="skeleton mb-2" style={{ width: 200, height: 32, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 150, height: 16, borderRadius: 4 }} />
            </div>
            <div className="skeleton" style={{ width: 140, height: 40, borderRadius: 4 }} />
          </div>
          <SkeletonStats cols={4} />
          <Row className="mt-4">
            <Col lg={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="skeleton mb-3" style={{ width: 80, height: 20, borderRadius: 4 }} />
                  <SkeletonList items={6} />
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="skeleton" style={{ width: 100, height: 20, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 4 }} />
                  </div>
                  <SkeletonList items={5} />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-in">
          <div>
            <h2 className="fw-bold mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem' }}>
              Panel de Administración
            </h2>
            <small className="text-muted">Bienvenido de nuevo, <span className="fw-medium">{user?.email}</span></small>
          </div>
          <Button 
            variant="outline-dark" 
            onClick={handleLogout}
            className="d-flex align-items-center"
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <BoxArrowRight className="me-2" /> Cerrar sesión
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="h-100 border-0 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <Card.Body className="d-flex align-items-center p-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    boxShadow: '0 4px 12px #3B82F640'
                  }}
                >
                  <Calendar size={24} color="white" />
                </div>
                <div>
                  <div className="text-muted small text-uppercase fw-medium" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    Total Citas
                  </div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1 }}>
                    {stats.appointments}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="h-100 border-0 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Card.Body className="d-flex align-items-center p-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    boxShadow: '0 4px 12px #F59E0B40'
                  }}
                >
                  <ExclamationCircle size={24} color="white" />
                </div>
                <div>
                  <div className="text-muted small text-uppercase fw-medium" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    Pendientes
                  </div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#D97706' }}>
                    {stats.pending}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="h-100 border-0 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Card.Body className="d-flex align-items-center p-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow: '0 4px 12px #10B98140'
                  }}
                >
                  <CheckCircle size={24} color="white" />
                </div>
                <div>
                  <div className="text-muted small text-uppercase fw-medium" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    Confirmadas
                  </div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#059669' }}>
                    {stats.confirmed}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3}>
            <Card className="h-100 border-0 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Card.Body className="d-flex align-items-center p-4">
                <div 
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{ 
                    width: 56, 
                    height: 56, 
                    borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                    boxShadow: '0 4px 12px #8B5CF640'
                  }}
                >
                  <PlayCircle size={24} color="white" />
                </div>
                <div>
                  <div className="text-muted small text-uppercase fw-medium" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    Completadas
                  </div>
                  <div className="fw-bold" style={{ fontSize: '1.75rem', lineHeight: 1, color: '#7C3AED' }}>
                    {stats.completed}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Menu */}
          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Card.Body className="p-0">
                <div className="p-4 pb-0">
                  <h5 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-display)' }}>Gestión</h5>
                </div>
                <ListGroup variant="flush">
                  {menuItems.map((item, index) => (
                    <ListGroup.Item
                      key={item.path}
                      action
                      as={Link}
                      to={item.path}
                      className="d-flex align-items-center p-4"
                      style={{ 
                        animationDelay: `${0.6 + index * 0.05}s`,
                        borderRadius: 0,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div 
                        className="d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: 'var(--radius-sm)',
                          background: item.bg
                        }}
                      >
                        <item.icon size={18} style={{ color: item.color }} />
                      </div>
                      <span className="fw-medium flex-grow-1">{item.label}</span>
                      <ChevronRight size={18} className="text-muted" />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Recent Appointments */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-display)' }}>Citas recientes</h5>
                  <Button variant="outline-primary" size="sm" as={Link} to="/admin/appointments">
                    Ver todas
                  </Button>
                </div>
                
                {recentAppointments.length === 0 ? (
                  <div className="text-center py-5">
                    <Calendar size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                    <p className="text-muted mb-0">No hay citas registradas</p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {recentAppointments.map((apt, index) => (
                      <ListGroup.Item 
                        key={apt.id} 
                        className="px-0 py-3"
                        style={{ 
                          animationDelay: `${0.7 + index * 0.05}s`,
                          borderBottom: index < recentAppointments.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center me-3"
                              style={{ 
                                width: 44, 
                                height: 44, 
                                background: `linear-gradient(135deg, #3B82F6, #2563EB)`,
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.9rem'
                              }}
                            >
                              {apt.nombre_cliente?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-semibold">{apt.nombre_cliente}</div>
                              <div className="text-muted small">
                                {new Date(apt.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} • {apt.hora_inicio?.substring(0, 5)}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            {getStatusBadge(apt.estado)}
                            <div className="fw-bold mt-1" style={{ color: '#1f2937' }}>
                              {parseFloat(apt.precio_total).toFixed(2)}€
                            </div>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminDashboard;
