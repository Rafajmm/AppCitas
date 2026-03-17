import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Shop, ArrowRight, Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { SkeletonText } from '../../components/SkeletonLoader';

function BusinessList() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const data = await publicApi.getBusinesses();
      setBusinesses(data);
    } catch (err) {
      setError('Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(b => 
    b.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (b.descripcion && b.descripcion.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-vh-100" style={{
        background: `
          radial-gradient(ellipse at 20% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #fafbfc 0%, #f3f4f6 100%)
        `
      }}>
        <Container className="py-5">
          <div className="text-center mb-5">
            <div className="skeleton mx-auto mb-3" style={{ width: 160, height: 48, borderRadius: 8 }} />
            <div className="skeleton mx-auto" style={{ width: 300, height: 20, borderRadius: 4 }} />
          </div>
          <Row className="justify-content-center mb-5">
            <Col md={7}>
              <div className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-md)' }} />
            </Col>
          </Row>
          <Row>
            {[1, 2, 3].map((i) => (
              <Col key={i} md={6} lg={4} className="mb-4">
                <Card className="h-100 border-0 shadow-sm">
                  <div className="skeleton" style={{ height: 8 }} />
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center mb-4">
                      <div className="skeleton rounded-circle me-3" style={{ width: 72, height: 72 }} />
                      <div>
                        <div className="skeleton mb-2" style={{ width: 120, height: 20 }} />
                        <div className="skeleton" style={{ width: 80, height: 12 }} />
                      </div>
                    </div>
                    <SkeletonText lines={2} />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{
      background: `
        radial-gradient(ellipse at 20% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
        linear-gradient(180deg, #fafbfc 0%, #f3f4f6 100%)
      `
    }}>
      <Container className="py-5">
        <div className="text-center mb-5 animate-fade-in-up">
          <h1 className="display-3 fw-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            <span style={{ color: 'var(--primary-color)' }}>App</span>Citas
          </h1>
          <p className="lead text-muted mx-auto" style={{ maxWidth: '500px' }}>
            Descubre y reserva en los mejores establecimientos de tu ciudad
          </p>
        </div>

        <Row className="justify-content-center mb-5 animate-fade-in-up stagger-1">
          <Col md={7}>
            <InputGroup className="glass-card p-2" style={{ backdropFilter: 'blur(20px)' }}>
              <InputGroup.Text className="bg-transparent border-0">
                <Search size={20} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent shadow-none"
                style={{ fontSize: '1.1rem' }}
              />
            </InputGroup>
          </Col>
        </Row>

        {error && (
          <div className="alert alert-danger text-center animate-fade-in">{error}</div>
        )}

        <Row className="justify-content-center">
          {filteredBusinesses.map((business, index) => (
            <Col key={business.id} md={6} lg={4} className="mb-4" style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
              <Card 
                className="h-100 cursor-pointer animate-fade-in-up"
                style={{ 
                  animationDelay: `${0.1 + index * 0.1}s`,
                  border: 'none',
                  overflow: 'hidden',
                  background: 'white',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/${business.slug}`)}
              >
                <div 
                  style={{ 
                    height: '8px', 
                    background: `linear-gradient(90deg, ${business.color_primario || '#3B82F6'}, ${business.color_secundario || '#10B981'})` 
                  }} 
                />
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-4">
                    {business.logo_url ? (
                      <div 
                        className="rounded-circle me-3 position-relative"
                        style={{
                          width: 72,
                          height: 72,
                          overflow: 'hidden',
                          border: `3px solid ${business.color_primario || '#3B82F6'}20`,
                          boxShadow: `0 4px 12px ${business.color_primario || '#3B82F6'}30`
                        }}
                      >
                        <img
                          src={business.logo_url}
                          alt={business.nombre}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{
                          width: 72,
                          height: 72,
                          background: `linear-gradient(135deg, ${business.color_primario || '#3B82F6'}, ${business.color_primario ? '#00000020' : '#2563EB'})`,
                          boxShadow: `0 4px 12px ${business.color_primario || '#3B82F6'}40`
                        }}
                      >
                        <Shop color="white" size={32} />
                      </div>
                    )}
                    
                    <div className="flex-grow-1">
                      <h5 className="mb-1 fw-bold" style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
                        {business.nombre}
                      </h5>
                      <small className="text-muted d-flex align-items-center">
                        <span className="d-inline-block" style={{ width: 12, height: 2, background: '#d1d5db', borderRadius: 2, marginRight: 8 }} />
                        {business.direccion}
                      </small>
                    </div>
                  </div>
                  
                  <p className="text-muted text-truncate-2 mb-4" style={{ lineHeight: 1.6 }}>
                    {business.descripcion || 'Sin descripción disponible'}
                  </p>
                  
                  <Button 
                    variant="link" 
                    className="w-100 p-0 d-flex align-items-center justify-content-between"
                    style={{ 
                      color: business.color_primario || 'var(--primary-color)',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    <span>Ver servicios</span>
                    <ArrowRight size={18} />
                  </Button>
                </Card.Body>
                
                <div 
                  className="position-absolute"
                  style={{
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${business.color_primario || '#3B82F6'}, transparent)`,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scaleX(1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scaleX(0)'}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {filteredBusinesses.length === 0 && !loading && (
          <div className="text-center py-5 animate-fade-in">
            <div className="mb-4">
              <Shop size={64} className="text-muted" style={{ opacity: 0.3 }} />
            </div>
            <h4 className="text-muted">No se encontraron negocios</h4>
            <p className="text-muted">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </Container>
    </div>
  );
}

export default BusinessList;
