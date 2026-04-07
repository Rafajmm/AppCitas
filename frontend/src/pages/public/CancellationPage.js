import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { CheckCircle, XCircle } from 'react-bootstrap-icons';
import { publicApi } from '../../services/api';

function CancellationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  const cancelBooking = async () => {
    try {
      const result = await publicApi.cancelBooking(token);
      
      if (result.alreadyCancelled) {
        setStatus('success');
        setMessage('Esta cita ya había sido cancelada anteriormente.');
      } else {
        setStatus('success');
        setMessage(result.message || 'Tu cita ha sido cancelada correctamente.');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setStatus('error');
      
      if (err.message?.includes('Invalid token') || err.status === 404) {
        setMessage('El enlace no es válido o ha expirado.');
      } else {
        setMessage(err.message || 'Error al cancelar la cita. Por favor, intenta nuevamente.');
      }
    }
  };

  useEffect(() => {
    cancelBooking();
  }, [token]);

  return (
    <Container className="py-5 text-center">
      {status === 'loading' && (
        <div className="py-5">
          <Spinner animation="border" size="lg" />
          <p className="mt-3 text-muted">Cancelando tu cita...</p>
        </div>
      )}

      {status === 'success' && (
        <Card className="d-inline-block">
          <Card.Body className="p-5">
            <CheckCircle size={80} className="text-success mb-4" />
            <h3 className="fw-bold mb-3">¡Cita cancelada!</h3>
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

export default CancellationPage;
