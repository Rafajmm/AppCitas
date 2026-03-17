import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { 
  GraphUp, 
  Building, 
  People, 
  CalendarCheck, 
  ArrowUp, 
  ArrowDown,
  Plus,
  Eye,
  Gear,
  BoxArrowRight
} from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function SuperadminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboard(user.token);
      setDashboardData(data);
    } catch (err) {
      setError('Error al cargar el dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getChangeIcon = (current, previous) => {
    if (current > previous) return <ArrowUp className="text-success" />;
    if (current < previous) return <ArrowDown className="text-danger" />;
    return null;
  };

  const getChangeColor = (current, previous) => {
    if (current > previous) return 'text-success';
    if (current < previous) return 'text-danger';
    return 'text-muted';
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="text-center">
          <Spinner animation="border" size="lg" className="mb-3" style={{ color: 'white' }} />
          <p className="text-white">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <Alert variant="danger" className="text-center">
                <h4>Error</h4>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={loadDashboard}>
                  Reintentar
                </Button>
              </Alert>
            </Col>
          </Row>
        </Container>
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
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(102, 126, 234, 0.2) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(118, 75, 162, 0.2) 0%, transparent 70%)',
        animation: 'pulse 6s ease-in-out infinite 3s',
        borderRadius: '50%'
      }} />

      <Container className="position-relative" style={{ zIndex: 1, paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="text-white fw-bold mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem' }}>
                  Panel de Superadministrador
                </h1>
                <p className="text-white-50 mb-0">
                  Bienvenido, {user?.nombre} • Gestión centralizada de AppCitas
                </p>
              </div>
              <Button 
                variant="outline-light" 
                onClick={handleLogout}
                className="d-flex align-items-center"
              >
                <BoxArrowRight className="me-2" />
                Cerrar Sesión
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 h-100 animate-fade-in-up" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex align-items-center justify-content-center me-3" style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                  }}>
                    <Building size={28} color="white" />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '2rem', color: '#2d3748' }}>
                      {dashboardData?.totalNegocios || 0}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Negocios Totales</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-2">
                    {dashboardData?.negociosActivos || 0} activos
                  </Badge>
                  <span className="text-muted small">
                    {((dashboardData?.negociosActivos / dashboardData?.totalNegocios) * 100).toFixed(1)}% activos
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 h-100 animate-fade-in-up stagger-1" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex align-items-center justify-content-center me-3" style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                    boxShadow: '0 8px 25px rgba(240, 147, 251, 0.3)'
                  }}>
                    <People size={28} color="white" />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '2rem', color: '#2d3748' }}>
                      {dashboardData?.totalAdmins || 0}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Administradores</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg="info" className="me-2">
                    {dashboardData?.adminsActivos || 0} activos
                  </Badge>
                  <span className="text-muted small">
                    {((dashboardData?.adminsActivos / dashboardData?.totalAdmins) * 100).toFixed(1)}% activos
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 h-100 animate-fade-in-up stagger-2" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex align-items-center justify-content-center me-3" style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                    boxShadow: '0 8px 25px rgba(79, 172, 254, 0.3)'
                  }}>
                    <CalendarCheck size={28} color="white" />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '2rem', color: '#2d3748' }}>
                      {dashboardData?.totalCitas || 0}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Citas Totales</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg="warning" className="me-2">
                    {dashboardData?.citasHoy || 0} hoy
                  </Badge>
                  <span className="text-muted small">
                    {dashboardData?.citasEsteMes || 0} este mes
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 h-100 animate-fade-in-up stagger-3" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="d-flex align-items-center justify-content-center me-3" style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, #fa709a, #fee140)',
                    boxShadow: '0 8px 25px rgba(250, 112, 154, 0.3)'
                  }}>
                    <GraphUp size={28} color="white" />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '2rem', color: '#2d3748' }}>
                      {dashboardData?.citasEsteMes || 0}
                    </h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Citas este Mes</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg="success" className="me-2">
                    +{Math.round((dashboardData?.citasEsteMes / 30) * 100)}% vs. mes anterior
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions & Recent Data */}
        <Row className="g-4">
          <Col md={8}>
            <Card className="border-0 animate-fade-in-up" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
            }}>
              <Card.Header className="bg-transparent border-0 px-4 pt-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0" style={{ color: '#2d3748' }}>
                    Acciones Rápidas
                  </h4>
                  <Gear className="text-muted" />
                </div>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                <Row className="g-3">
                  <Col md={6}>
                    <Button 
                      variant="outline-primary" 
                      className="w-100 d-flex align-items-center justify-content-center py-3"
                      onClick={() => navigate('/superadmin/administradores')}
                      style={{
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid #667eea',
                        color: '#667eea',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Plus className="me-2" />
                      Crear Administrador
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Button 
                      variant="outline-success" 
                      className="w-100 d-flex align-items-center justify-content-center py-3"
                      onClick={() => navigate('/superadmin/negocios')}
                      style={{
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid #48bb78',
                        color: '#48bb78',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Building className="me-2" />
                      Crear Negocio
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Button 
                      variant="outline-info" 
                      className="w-100 d-flex align-items-center justify-content-center py-3"
                      onClick={() => navigate('/superadmin/administradores')}
                      style={{
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid #4299e1',
                        color: '#4299e1',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <People className="me-2" />
                      Ver Administradores
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Button 
                      variant="outline-warning" 
                      className="w-100 d-flex align-items-center justify-content-center py-3"
                      onClick={() => navigate('/superadmin/negocios')}
                      style={{
                        borderRadius: 'var(--radius-lg)',
                        border: '2px solid #ed8936',
                        color: '#ed8936',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Eye className="me-2" />
                      Ver Negocios
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 animate-fade-in-up" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
            }}>
              <Card.Header className="bg-transparent border-0 px-4 pt-4">
                <h4 className="fw-bold mb-0" style={{ color: '#2d3748' }}>
                  Actividad Reciente
                </h4>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Negocios Recientes</h6>
                  {dashboardData?.negociosRecientes?.slice(0, 3).map((negocio, index) => (
                    <div key={negocio.id} className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <p className="mb-0 fw-medium" style={{ color: '#2d3748', fontSize: '0.9rem' }}>
                          {negocio.nombre}
                        </p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                          {negocio.slug}
                        </p>
                      </div>
                      <Badge bg="light" text="dark" className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        Nuevo
                      </Badge>
                    </div>
                  ))}
                </div>

                <div>
                  <h6 className="text-muted mb-3">Administradores Recientes</h6>
                  {dashboardData?.adminsRecientes?.slice(0, 3).map((admin, index) => (
                    <div key={admin.id} className="d-flex align-items-center justify-content-between mb-2">
                      <div>
                        <p className="mb-0 fw-medium" style={{ color: '#2d3748', fontSize: '0.9rem' }}>
                          {admin.nombre}
                        </p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                          {admin.email}
                        </p>
                      </div>
                      <Badge bg={admin.rol === 'superadmin' ? 'danger' : 'primary'} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        {admin.rol}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        
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

export default SuperadminDashboard;
