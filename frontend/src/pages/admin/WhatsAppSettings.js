import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft, Whatsapp } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function WhatsAppSettings() {
  const { user } = useAuth();
  const [negocios, setNegocios] = useState([]);
  const [selectedNegocio, setSelectedNegocio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadNegocios();
  }, [user?.token]);

  useEffect(() => {
    if (selectedNegocio) {
      loadCurrentConfig();
    }
  }, [selectedNegocio, user?.token]);

  const loadNegocios = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getMyNegocios(user.token);
      setNegocios(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedNegocio(data[0].id);
      }
    } catch (err) {
      setError('Error al cargar negocios');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentConfig = async () => {
    if (!selectedNegocio) return;
    
    try {
      const data = await adminApi.getMyNegocios(user.token);
      const negocio = Array.isArray(data) ? data.find(n => n.id === selectedNegocio) : null;
      if (negocio) {
        setWhatsapp(negocio.whatsapp || '');
      }
    } catch (err) {
      console.error('Error loading current config:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await adminApi.updateWhatsApp(user.token, selectedNegocio, {
        whatsapp: whatsapp || null,
      });
      setSuccess('Configuración de WhatsApp actualizada correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const formatPhoneNumber = (value) => {
    // Solo permitir dígitos
    return value.replace(/\D/g, '');
  };

  const handleWhatsappChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setWhatsapp(formatted);
  };

  if (loading) {
    return (
      <div className="min-vh-100" style={{ background: '#f8fafc' }}>
        <Container className="py-4">
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" role="status" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      <Container className="py-4">
        <div className="d-flex align-items-center mb-4">
          <Button variant="outline-secondary" className="me-3" as={Link} to="/admin">
            <ArrowLeft />
          </Button>
          <div>
            <h2 className="fw-bold mb-0">Configuración de WhatsApp</h2>
            <div className="text-muted small">Gestiona el botón de contacto por WhatsApp</div>
          </div>
        </div>

        {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4">{success}</Alert>}

        <Card className="border-0 shadow-sm">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Negocio</Form.Label>
                <Form.Select
                  value={selectedNegocio}
                  onChange={(e) => setSelectedNegocio(e.target.value)}
                  required
                >
                  <option value="">Selecciona un negocio</option>
                  {negocios.map((negocio) => (
                    <option key={negocio.id} value={negocio.id}>
                      {negocio.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <Whatsapp className="me-2" color="#25D366" size={20} />
                  Número de WhatsApp
                </Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="34600123456"
                  value={whatsapp}
                  onChange={handleWhatsappChange}
                  maxLength={15}
                />
                <Form.Text className="text-muted">
                  Ingresa el número completo con el código del país (ej: 34600123456 para España). 
                  Si dejas este campo vacío, el botón de WhatsApp no aparecerá para los clientes.
                </Form.Text>
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  {whatsapp && (
                    <div>
                      <strong>Vista previa:</strong> Los clientes podrán contactarte por WhatsApp al número +{whatsapp}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving || !selectedNegocio}
                  className="px-4"
                >
                  {saving ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar configuración'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Card className="border-0 shadow-sm mt-4">
          <Card.Body>
            <h5 className="fw-bold mb-3">¿Cómo funciona?</h5>
            <ol className="mb-0">
              <li className="mb-2">Activa el botón de WhatsApp usando el interruptor</li>
              <li className="mb-2">Ingresa tu número de teléfono completo con código de país</li>
              <li className="mb-2">Guarda la configuración</li>
              <li className="mb-2">El botón aparecerá en la página de reservas y durante el proceso de booking</li>
              <li>Los clientes podrán contactarte directamente por WhatsApp con un solo clic</li>
            </ol>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default WhatsAppSettings;
