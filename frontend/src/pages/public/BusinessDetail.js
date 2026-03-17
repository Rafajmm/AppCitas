import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Badge, ListGroup } from 'react-bootstrap';
import { ArrowLeft, Clock, Cash, ArrowRight } from 'react-bootstrap-icons';
import { publicApi } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

function BusinessDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setBusiness } = useTheme();
  const [business, setBusinessLocal] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [businessData, servicesData] = await Promise.all([
        publicApi.getBusiness(slug),
        publicApi.getServices(slug),
      ]);
      setBusinessLocal(businessData);
      setBusiness(businessData);
      setServices(servicesData);
    } catch (err) {
      setError('Error al cargar información del negocio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const toggleService = (service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duracion_minutos, 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.precio), 0);

  const handleContinue = () => {
    if (selectedServices.length === 0) return;
    navigate(`/${slug}/booking`, {
      state: { services: selectedServices, business }
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error || !business) {
    return (
      <Container className="py-5 text-center">
        <div className="alert alert-danger">{error || 'Negocio no encontrado'}</div>
        <Button variant="primary" onClick={() => navigate('/')}>
          <ArrowLeft className="me-2" /> Volver
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="outline-secondary" className="mb-4" onClick={() => navigate('/')}>
        <ArrowLeft className="me-2" /> Volver
      </Button>

      <div
        className="rounded-4 p-4 mb-4 text-white"
        style={{ backgroundColor: business.color_primario || '#3B82F6' }}
      >
        <div className="d-flex align-items-center mb-3">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={business.nombre}
              className="rounded-circle me-3"
              style={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.3)',
              }}
              onError={(e) => {
                // Fallback: hide image if fails to load
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          <div>
            <h1 className="fw-bold mb-2">{business.nombre}</h1>
            <p className="mb-0 opacity-75">{business.descripcion}</p>
          </div>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          <h4 className="mb-3">Selecciona servicios</h4>
          <ListGroup>
            {services.filter(s => s.activo).map((service) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              return (
                <ListGroup.Item
                  key={service.id}
                  action
                  active={isSelected}
                  onClick={() => toggleService(service)}
                  className="py-3"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 fw-bold">{service.nombre}</h6>
                      <small className="text-muted">{service.descripcion}</small>
                    </div>
                    <div className="text-end">
                      <Badge bg="primary" className="me-2">
                        <Clock className="me-1" size={12} />
                        {service.duracion_minutos} min
                      </Badge>
                      <Badge bg="success">
                        <Cash className="me-1" size={12} />
                        {parseFloat(service.precio).toFixed(2)}€
                      </Badge>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: 20 }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">Resumen</h5>
              {selectedServices.length === 0 ? (
                <p className="text-muted">Selecciona al menos un servicio</p>
              ) : (
                <>
                  <ListGroup variant="flush" className="mb-3">
                    {selectedServices.map(s => (
                      <ListGroup.Item key={s.id} className="px-0 d-flex justify-content-between">
                        <span>{s.nombre}</span>
                        <span className="fw-bold">{parseFloat(s.precio).toFixed(2)}€</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span><Clock className="me-2" />Duración total:</span>
                    <span className="fw-bold">{totalDuration} min</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span><Cash className="me-2" />Total:</span>
                    <span className="fw-bold fs-5">{totalPrice.toFixed(2)}€</span>
                  </div>
                </>
              )}
              <Button
                variant="primary"
                className="w-100"
                disabled={selectedServices.length === 0}
                onClick={handleContinue}
              >
                Continuar <ArrowRight className="ms-2" />
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default BusinessDetail;
