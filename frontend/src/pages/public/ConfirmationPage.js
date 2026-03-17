import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'react-bootstrap-icons';
import { publicApi } from '../../services/api';

function ConfirmationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const confirmBooking = async () => {
    try {
      const result = await publicApi.confirmBooking(token);
      
      if (result.alreadyConfirmed) {
        setStatus('success');
        setMessage('Esta cita ya ha sido confirmada anteriormente.');
      } else {
        setStatus('success');
        setMessage(result.message || 'Tu cita ha sido confirmada correctamente.');
      }
    } catch (err) {
      console.error('Confirmation error:', err);
      setStatus('error');
      
      // Handle different error types
      if (err.message?.includes('Invalid token') || err.status === 404) {
        setMessage('El enlace de confirmación no es válido o ha expirado.');
      } else {
        setMessage(err.message || 'Error al confirmar la cita. Por favor, intenta nuevamente.');
      }
    }
  };

  useEffect(() => {
    confirmBooking();
  }, [token]);

  return (
    <Container className="py-5 text-center">
      {status === 'loading' && (
        <div className="py-5">
          <Spinner animation="border" size="lg" />
          <p className="mt-3 text-muted">Confirmando tu cita...</p>
        </div>
      )}

      {status === 'success' && (
        <Card className="d-inline-block">
          <Card.Body className="p-5">
            <CheckCircle size={80} className="text-success mb-4" />
            <h3 className="fw-bold mb-3">¡Cita confirmada!</h3>
            <p className="text-muted mb-4">{message}</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </Card.Body>
        </Card>
      )}

      {status === 'error' && (
        <Card className="d-inline-block border-danger">
          <Card.Body className="p-5">
            <XCircle size={80} className="text-danger mb-4" />
            <h3 className="fw-bold mb-3">Error</h3>
            <Alert variant="danger">{message}</Alert>
            <Button variant="primary" onClick={() => navigate('/')}>
              Volver al inicio
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default ConfirmationPage;
