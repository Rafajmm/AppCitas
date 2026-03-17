import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { ArrowLeft, Palette, Image, Globe, Phone, Check, X, Upload } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewLogo, setPreviewLogo] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    descripcion: '',
    logo_url: '',
    color_primario: '#3B82F6',
    color_secundario: '#10B981',
    color_acento: '#c0cc11',
    whatsapp: '',
    web_url: '',
    reservas_habilitadas: true,
    antelacion_minima_horas: 2,
    tiempo_confirmacion_minutos: 30,
  });

  useEffect(() => {
    loadNegocio();
  }, []);

  const loadNegocio = async () => {
    try {
      const negocios = await adminApi.getNegocios(user.token);
      if (negocios.length > 0) {
        const negocioData = negocios[0];
        setNegocio(negocioData);
        setFormData({
          descripcion: negocioData.descripcion || '',
          logo_url: negocioData.logo_url || '',
          color_primario: negocioData.color_primario || '#3B82F6',
          color_secundario: negocioData.color_secundario || '#10B981',
          color_acento: negocioData.color_acento || '#c0cc11',
          whatsapp: negocioData.whatsapp || '',
          web_url: negocioData.web_url || '',
          reservas_habilitadas: negocioData.reservas_habilitadas ?? true,
          antelacion_minima_horas: negocioData.antelacion_minima_horas || 2,
          tiempo_confirmacion_minutos: negocioData.tiempo_confirmacion_minutos || 30,
        });
        setPreviewLogo(negocioData.logo_url);
      }
    } catch (err) {
      setError('Error al cargar datos del negocio');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updatedNegocio = await adminApi.updateNegocio(user.token, negocio.id, formData);
      setNegocio(updatedNegocio);
      setSuccess('Configuración actualizada correctamente');
    } catch (err) {
      setError(err.message || 'Error al actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, logo_url: url }));
    setPreviewLogo(url);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedFile) return;

    setUploadingLogo(true);
    setError('');
    setSuccess('');

    try {
      const result = await adminApi.uploadLogo(user.token, negocio.id, selectedFile);
      setFormData(prev => ({ ...prev, logo_url: result.logoUrl }));
      setNegocio(prev => ({ ...prev, logo_url: result.logoUrl }));
      setSelectedFile(null);
      setSuccess('Logo subido correctamente');
    } catch (err) {
      setError(err.message || 'Error al subir el logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" onClick={() => navigate('/admin')} className="me-3">
            <ArrowLeft className="me-2" /> Volver
          </Button>
          <div>
            <h2 className="fw-bold mb-0">
              <Palette className="me-2" />
              Personalización del Negocio
            </h2>
            <small className="text-muted">Configura la apariencia y opciones de tu negocio</small>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Logo</Form.Label>
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="me-3"
                          />
                          <Button 
                            variant="outline-primary" 
                            onClick={handleLogoUpload}
                            disabled={!selectedFile || uploadingLogo}
                          >
                            {uploadingLogo ? (
                              <Spinner animation="border" size="sm" className="me-2" />
                            ) : (
                              <Upload className="me-2" />
                            )}
                            Subir Logo
                          </Button>
                        </div>
                        {previewLogo && (
                          <div className="d-flex align-items-center">
                            <img 
                              src={previewLogo} 
                              alt="Logo preview" 
                              className="me-3"
                              style={{ width: '60px', height: '60px', objectFit: 'contain', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <div>
                              <small className="text-muted">Archivo: {selectedFile?.name || 'URL actual'}</small>
                              <br />
                              <small className="text-muted">Tamaño: {(selectedFile?.size / 1024).toFixed(1)} KB</small>
                            </div>
                          </div>
                        )}
                      </div>
                      <Form.Text className="text-muted">
                        Sube un archivo de imagen (JPEG, PNG, GIF, WebP) - Máximo 2MB
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción del Negocio</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Describe tu negocio..."
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="fw-bold mb-3 mt-4">
                  <Palette className="me-2" />
                  Colores de la Marca
                </h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Color Primario</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="color"
                          name="color_primario"
                          value={formData.color_primario}
                          onChange={handleInputChange}
                          className="me-2"
                          style={{ width: '60px', height: '38px' }}
                        />
                        <Form.Control
                          type="text"
                          value={formData.color_primario}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_primario: e.target.value }))}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Color Secundario</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="color"
                          name="color_secundario"
                          value={formData.color_secundario}
                          onChange={handleInputChange}
                          className="me-2"
                          style={{ width: '60px', height: '38px' }}
                        />
                        <Form.Control
                          type="text"
                          value={formData.color_secundario}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_secundario: e.target.value }))}
                          placeholder="#10B981"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Color de Acento</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="color"
                          name="color_acento"
                          value={formData.color_acento}
                          onChange={handleInputChange}
                          className="me-2"
                          style={{ width: '60px', height: '38px' }}
                        />
                        <Form.Control
                          type="text"
                          value={formData.color_acento}
                          onChange={(e) => setFormData(prev => ({ ...prev, color_acento: e.target.value }))}
                          placeholder="#c0cc11"
                        />
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="fw-bold mb-3 mt-4">
                  <Globe className="me-2" />
                  Contacto y Web
                </h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Phone className="me-1" />
                        WhatsApp
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="+34 600 000 000"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Globe className="me-1" />
                        Sitio Web
                      </Form.Label>
                      <Form.Control
                        type="url"
                        name="web_url"
                        value={formData.web_url}
                        onChange={handleInputChange}
                        placeholder="https://tu-sitio-web.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="fw-bold mb-3 mt-4">Configuración de Reservas</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Antelación Mínima (horas)</Form.Label>
                      <Form.Control
                        type="number"
                        name="antelacion_minima_horas"
                        value={formData.antelacion_minima_horas}
                        onChange={handleInputChange}
                        min="0"
                        max="168"
                      />
                      <Form.Text className="text-muted">
                        Tiempo mínimo de antelación para reservar
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tiempo Confirmación (minutos)</Form.Label>
                      <Form.Control
                        type="number"
                        name="tiempo_confirmacion_minutos"
                        value={formData.tiempo_confirmacion_minutos}
                        onChange={handleInputChange}
                        min="1"
                        max="1440"
                      />
                      <Form.Text className="text-muted">
                        Tiempo para confirmar reserva por email
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="reservas_habilitadas"
                        checked={formData.reservas_habilitadas}
                        onChange={handleInputChange}
                        label="Habilitar reservas online"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={() => navigate('/admin')} className="me-2">
                    <X className="me-2" /> Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? (
                      <Spinner animation="border" size="sm" className="me-2" />
                    ) : (
                      <Check className="me-2" />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <h5 className="fw-bold mb-3">Vista Previa</h5>
              <div 
                className="p-3 rounded text-white"
                style={{ backgroundColor: formData.color_primario }}
              >
                <h6 className="mb-2">Tu Negocio</h6>
                <p className="mb-0 small">{formData.descripcion || 'Descripción de tu negocio...'}</p>
              </div>
              
              <div className="mt-3">
                <small className="text-muted d-block mb-2">Colores seleccionados:</small>
                <div className="d-flex gap-2">
                  <div 
                    className="rounded"
                    style={{ 
                      width: '30px', 
                      height: '30px', 
                      backgroundColor: formData.color_primario 
                    }}
                    title="Primario"
                  />
                  <div 
                    className="rounded"
                    style={{ 
                      width: '30px', 
                      height: '30px', 
                      backgroundColor: formData.color_secundario 
                    }}
                    title="Secundario"
                  />
                  <div 
                    className="rounded"
                    style={{ 
                      width: '30px', 
                      height: '30px', 
                      backgroundColor: formData.color_acento 
                    }}
                    title="Acento"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminSettings;
