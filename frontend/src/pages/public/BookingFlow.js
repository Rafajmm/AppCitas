import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Form, ListGroup, Alert } from 'react-bootstrap';
import { ArrowLeft, Clock, Calendar, Person, Envelope, Telephone, CheckCircle, Mailbox, Check2 } from 'react-bootstrap-icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { publicApi } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

function BookingFlow() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { business } = useTheme();
  
  const primaryColor = business?.color_primario || '#3B82F6';
  const secondaryColor = business?.color_secundario || '#10B981';
  
  const services = useMemo(() => location.state?.services || [], [location.state?.services]);
  const totalDuration = services.reduce((sum, s) => sum + s.duracion_minutos, 0);
  const totalPrice = services.reduce((sum, s) => sum + parseFloat(s.precio), 0);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    notas: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  
  const [bookingData, setBookingData] = useState(null);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const serviceIds = services.map(s => s.id);
      const data = await publicApi.getAvailability(slug, dateStr, serviceIds);
      
      setSlots(data.slots || []);
    } catch (err) {
      console.error('Error loading slots:', err);
      setError('Error al cargar disponibilidad');
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, services, slug]);

  useEffect(() => {
    if (services.length === 0) {
      navigate(`/${slug}`);
    }
  }, [services, slug, navigate]);

  useEffect(() => {
    if (selectedDate) {
      loadSlots();
    }
  }, [selectedDate, loadSlots]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    
    if (formData.email !== formData.confirmEmail) {
      setError('Los emails no coinciden. Por favor, verifica ambos campos.');
      setSubmitting(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, introduce un email válido.');
      setSubmitting(false);
      return;
    }
    
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const bookingData = {
        serviceIds: services.map(s => s.id),
        date: dateStr,
        startTime: selectedSlot.start,
        client: {
          name: formData.nombre,
          email: formData.email || null,
          phone: formData.telefono || null,
        },
        notes: formData.notas || null,
      };
      
      const result = await publicApi.createBooking(slug, bookingData);
      setBookingResult(result);
      
      setBookingData({
        email: formData.email,
        name: formData.nombre,
        date: dateStr,
        startTime: selectedSlot.start
      });
      
      setStep(4);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setResendError('');
    setResendSuccess('');
    
    try {
      if (!bookingData) {
        throw new Error('No hay datos de reserva disponibles para reenvío');
      }
      
      await publicApi.resendConfirmation(bookingData);
      
      setResendSuccess('Email de confirmación reenviado correctamente. Revisa tu bandeja de entrada.');
    } catch (err) {
      console.error('Error resending email:', err);
      setResendError(err.message || 'Error al reenviar el email de confirmación');
    } finally {
      setResendingEmail(false);
    }
  };

  if (services.length === 0) return null;

  return (
    <div className="min-vh-100" style={{
      background: `
        radial-gradient(ellipse at 0% 0%, ${primaryColor}10 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, ${secondaryColor}10 0%, transparent 50%),
        linear-gradient(180deg, #fafbfc 0%, #f3f4f6 100%)
      `
    }}>
      <Container className="py-4">
        <Button 
          variant="link" 
          className="mb-4 ps-0 d-flex align-items-center"
          style={{ color: '#6b7280', textDecoration: 'none' }}
          onClick={() => step > 1 ? setStep(step - 1) : navigate(`/${slug}`)}
        >
          <ArrowLeft className="me-2" size={18} /> 
          {step > 1 ? 'Atrás' : 'Volver'}
        </Button>

        {/* Progress Steps */}
        <div className="d-flex justify-content-center mb-5">
          {[1, 2, 3].map((s, index) => (
            <React.Fragment key={s}>
              <div 
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: s <= step 
                    ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` 
                    : '#e5e7eb',
                  color: s <= step ? 'white' : '#9ca3af',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  boxShadow: s <= step ? `${primaryColor}40` : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {s < step ? <Check2 size={20} /> : s === 1 ? <Calendar size={18} /> : s === 2 ? <Clock size={18} /> : <Person size={18} />}
              </div>
              {s < 3 && (
                <div 
                  style={{ 
                    width: 60, 
                    height: 2, 
                    background: s < step ? primaryColor : '#e5e7eb',
                    margin: '0 8px',
                    transition: 'background 0.3s ease'
                  }} 
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <Alert variant="danger" className="mb-4 animate-fade-in">
            {error}
          </Alert>
        )}

        {/* Step 1: Date Selection */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Selecciona una fecha
              </h3>
              <p className="text-muted">Elige el día para tu cita</p>
            </div>
            
            <Row className="justify-content-center">
              <Col md={6} className="text-center">
                <div className="d-inline-block glass-card p-4" style={{ backdropFilter: 'blur(20px)' }}>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setTimeout(() => setStep(2), 300);
                    }}
                    minDate={new Date()}
                    inline
                    className="form-control"
                    monthsShown={1}
                  />
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Horarios disponibles
              </h3>
              <p className="text-muted">
                {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {loadingSlots ? (
              <div className="text-center py-5">
                <Spinner animation="border" style={{ color: primaryColor }} />
                <p className="mt-3 text-muted">Cargando horarios...</p>
              </div>
            ) : slots.length === 0 ? (
              <Alert variant="info" className="text-center">
                <p className="mb-2">No hay disponibilidad para esta fecha.</p>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Elegir otra fecha
                </Button>
              </Alert>
            ) : (
              <>
                <Row className="justify-content-center">
                  {slots.map((slot, index) => (
                    <Col key={slot.start} xs={6} sm={4} md={3} lg={2} className="mb-3">
                      <div
                        className="cursor-pointer text-center p-3 animate-scale-in"
                        style={{
                          animationDelay: `${index * 0.05}s`,
                          borderRadius: 'var(--radius-md)',
                          border: selectedSlot?.start === slot.start 
                            ? `2px solid ${primaryColor}` 
                            : '2px solid transparent',
                          background: selectedSlot?.start === slot.start 
                            ? `${primaryColor}15` 
                            : 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: selectedSlot?.start === slot.start 
                            ? `${primaryColor}20` 
                            : '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                        onClick={() => setSelectedSlot(slot)}
                        onMouseEnter={(e) => {
                          if (selectedSlot?.start !== slot.start) {
                            e.currentTarget.style.background = `${primaryColor}08`;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedSlot?.start !== slot.start) {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <div 
                          style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 600,
                            color: selectedSlot?.start === slot.start ? primaryColor : '#1f2937'
                          }}
                        >
                          {slot.start}
                        </div>
                        <small className="text-muted">{slot.durationMinutes} min</small>
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            )}
            
            <div className="text-center mt-4">
              <Button
                variant="outline-secondary"
                className="me-3"
                onClick={() => setStep(1)}
              >
                Cambiar fecha
              </Button>
              <Button
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  border: 'none'
                }}
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Customer Data */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-4">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                Tus datos
              </h3>
              <p className="text-muted">Completa la información para confirmar tu reserva</p>
            </div>
            
            <Row>
              <Col md={6} className="mb-4">
                <Card className="h-100" style={{ border: 'none' }}>
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center">
                      <Person className="me-2" size={18} />
                      Información de contacto
                    </h6>
                    
                    <Form>
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Nombre completo *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                          required
                          placeholder="Tu nombre"
                          size="lg"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Email *</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          onBlur={(e) => {
                            const email = e.target.value;
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(email)) {
                              e.target.setCustomValidity('Por favor, introduce un email válido');
                            } else {
                              e.target.setCustomValidity('');
                            }
                          }}
                          onInput={(e) => e.target.setCustomValidity('')}
                          required
                          placeholder="tu@email.com"
                          size="lg"
                        />
                        <Form.Text className="text-muted">
                          Te enviaremos la confirmación aquí
                        </Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Confirmar Email *</Form.Label>
                        <Form.Control
                          type="email"
                          value={formData.confirmEmail || ''}
                          onChange={(e) => setFormData({...formData, confirmEmail: e.target.value})}
                          required
                          placeholder="Repite tu email"
                          size="lg"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-medium">Teléfono</Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.telefono}
                          onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                          placeholder="+34 600 000 000"
                          size="lg"
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-medium">Notas adicionales</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={formData.notas}
                          onChange={(e) => setFormData({...formData, notas: e.target.value})}
                          placeholder="Alguna información adicional..."
                        />
                      </Form.Group>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="mb-4" style={{ border: 'none', background: `${primaryColor}05` }}>
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-4 d-flex align-items-center">
                      <Calendar className="me-2" size={18} />
                      Resumen de tu cita
                    </h6>
                    
                    <div className="mb-3 pb-3" style={{ borderBottom: `1px solid ${primaryColor}20` }}>
                      <div className="d-flex align-items-center mb-3">
                        <div 
                          style={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: primaryColor,
                            marginRight: 12
                          }} 
                        />
                        <span className="text-muted">
                          {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <div 
                          style={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            background: secondaryColor,
                            marginRight: 12
                          }} 
                        />
                        <span className="text-muted">{selectedSlot?.start}</span>
                      </div>
                    </div>
                    
                    <ListGroup variant="flush" className="mb-3">
                      {services.map(s => (
                        <ListGroup.Item key={s.id} className="px-0 d-flex justify-content-between align-items-center">
                          <span>{s.nombre}</span>
                          <span className="fw-bold">{parseFloat(s.precio).toFixed(2)}€</span>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    
                    <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: `2px solid ${primaryColor}` }}>
                      <span className="fw-bold">Total:</span>
                      <span className="fw-bold" style={{ fontSize: '1.5rem', color: primaryColor }}>
                        {totalPrice.toFixed(2)}€
                      </span>
                    </div>
                    
                    <div className="d-flex justify-content-between text-muted mt-2">
                      <small><Clock className="me-1" size={14} />{totalDuration} min</small>
                    </div>
                  </Card.Body>
                </Card>
                
                <Button
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                    border: 'none',
                    padding: '14px 28px',
                    fontSize: '1.1rem'
                  }}
                  className="w-100"
                  disabled={!formData.nombre || !formData.email || submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? (
                    <><Spinner as="span" size="sm" className="me-2" />Confirmando...</>
                  ) : (
                    <>Confirmar reserva <CheckCircle className="ms-2" /></>
                  )}
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && bookingResult && (
          <div className="text-center py-5 animate-scale-in">
            <div 
              className="d-inline-flex align-items-center justify-content-center mb-4"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${secondaryColor}, ${secondaryColor}dd)`,
                boxShadow: `${secondaryColor}40`
              }}
            >
              <CheckCircle size={60} color="white" />
            </div>
            
            <h2 className="fw-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              ¡Reserva confirmada!
            </h2>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 400 }}>
              Hemos enviado un email a <strong>{formData.email}</strong> con los detalles de tu cita
            </p>
            
            <Card className="mx-auto mb-4 text-start" style={{ maxWidth: 400, border: 'none' }}>
              <Card.Body className="p-4" style={{ background: `${primaryColor}08`, borderRadius: 'var(--radius-md)' }}>
                <div className="d-flex align-items-center mb-3">
                  <Calendar size={18} className="me-2" style={{ color: primaryColor }} />
                  <span>{selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <div className="d-flex align-items-center">
                  <Clock size={18} className="me-2" style={{ color: primaryColor }} />
                  <span>{selectedSlot?.start}</span>
                </div>
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-center gap-3">
              <Button 
                style={{ 
                  background: 'white',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb'
                }}
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="me-2" size={16} />
                Volver al inicio
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default BookingFlow;
