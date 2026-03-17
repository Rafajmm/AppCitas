import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PersonFill, LockFill, CalendarCheck } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.login(email, password);
      login(response.token);
      
      // Redirect based on user role
      if (response.admin?.rol === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: `
        radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        linear-gradient(180deg, #0f172a 0%, #1e293b 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite',
        borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '10%',
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
        animation: 'pulse 4s ease-in-out infinite 2s',
        borderRadius: '50%'
      }} />
      
      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />

      <Container className="position-relative" style={{ zIndex: 1 }}>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="text-center mb-4 animate-fade-in-up">
              <div 
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
                }}
              >
                <CalendarCheck size={40} color="white" />
              </div>
              <h2 className="fw-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
                AppCitas
              </h2>
              <p className="text-white-50">Panel de administración</p>
            </div>

            <div className="animate-fade-in-up stagger-2">
              <Card 
                className="border-0"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                }}
              >
                <Card.Body className="p-5">
                  {error && (
                    <Alert variant="danger" className="animate-fade-in">
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-medium text-dark mb-2">
                        <PersonFill className="me-2" size={16} />
                        Email
                      </Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@demo.com"
                        required
                        disabled={loading}
                        size="lg"
                        style={{ 
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid #e5e7eb',
                          background: '#f9fafb'
                        }}
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-medium text-dark mb-2">
                        <LockFill className="me-2" size={16} />
                        Contraseña
                      </Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={loading}
                        size="lg"
                        style={{ 
                          borderRadius: 'var(--radius-sm)',
                          border: '1.5px solid #e5e7eb',
                          background: '#f9fafb'
                        }}
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      className="w-100 mb-4"
                      disabled={loading}
                      style={{ 
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        border: 'none',
                        padding: '14px 24px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </Form>

                  <div className="text-center pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                    <small className="text-muted">
                      Demo: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>admin@demo.com</code> / <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>admin1234</code>
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <a 
                href="/" 
                className="text-white-50 text-decoration-none small"
                style={{ transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                ← Volver al inicio
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default AdminLogin;
