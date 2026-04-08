import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Table, Modal, Form, Spinner, Badge, Alert, Row, Col, Overlay, Popover } from 'react-bootstrap';
import { Plus, Trash, ArrowLeft, Pencil } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function AdminBlockages() {
  const { user } = useAuth();
  const [blockages, setBlockages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  const calendarRef = useRef(null);
  const overlayTargetRef = useRef(null);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [quickMenu, setQuickMenu] = useState({ x: 0, y: 0, startStr: '', endStr: '', allDay: true });
  const [quickEmployeeId, setQuickEmployeeId] = useState('');
  const [quickSpecialHoursEnabled, setQuickSpecialHoursEnabled] = useState(false);
  const [quickHoraInicio, setQuickHoraInicio] = useState('09:00');
  const [quickHoraFin, setQuickHoraFin] = useState('14:00');
  
  const [formData, setFormData] = useState({
    negocioId: '',
    empleadoId: null,
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    titulo: '',
    descripcion: '',
  });

  const loadData = useCallback(async () => {
    try {
      // First load admin negocios to get negocioId
      const negociosData = await adminApi.getMyNegocios(user.token);
      
      if (negociosData.length > 0) {
        const activeNegocio = negociosData[0];
        const negocioId = activeNegocio.id;
        setNegocio(activeNegocio);
        setFormData(prev => ({ ...prev, negocioId }));
        
        // Now load blockages and employees with negocioId
        const [blockData, empData] = await Promise.all([
          adminApi.getBlockages(user.token, { negocioId }),
          adminApi.getEmployees(user.token),
        ]);
        setBlockages(blockData.filter(b => b.activo));
        setEmployees(empData);
      } else {
        setError('No tienes negocios asignados');
      }
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitBlockage(formData);
  };

  const submitBlockage = async (data, options = {}) => {
    const { hideModal = true } = options;
    setSaving(true);
    setError('');

    try {
      await adminApi.createBlockage(user.token, {
        ...data,
        empleadoId: data.empleadoId || null,
        hora_inicio: data.hora_inicio ? data.hora_inicio : null,
        hora_fin: data.hora_fin ? data.hora_fin : null,
        activo: true,
      });

      if (hideModal) setShowModal(false);
      setEditing(null);
      resetForm();
      setShowQuickMenu(false);
      setQuickSpecialHoursEnabled(false);
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al crear bloqueo');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este bloqueo?')) return;
    try {
      setLoading(true);
      await adminApi.deleteBlockage(user.token, id);
      await loadData();
    } catch (err) {
      setError('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      negocioId: formData.negocioId,
      empleadoId: null,
      fecha_inicio: '',
      fecha_fin: '',
      hora_inicio: '',
      hora_fin: '',
      titulo: '',
      descripcion: '',
    });
  };

  const toDateOnly = useCallback((dateLike) => {
    if (!dateLike) return '';
    
    // Si ya viene como "YYYY-MM-DD" puro (exactamente 10 caracteres), 
    // lo devolvemos tal cual para no alterar selecciones directas del calendario.
    if (typeof dateLike === 'string' && dateLike.length === 10) {
      return dateLike;
    }

    // Si es un string ISO que viene de BD (ej. "2026-04-19T22:00:00.000Z") o un objeto Date,
    // creamos la fecha para que el navegador ajuste a la zona horaria local.
    const d = new Date(dateLike);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const computeEventTiming = useCallback((b) => {
    const startDate = toDateOnly(b.fecha_inicio);
    const endDate = toDateOnly(b.fecha_fin);
    const hasTime = !!b.hora_inicio;

    if (!hasTime) {
      // 1. Calculamos el DÍA SIGUIENTE al endDate para cumplir 
      // con el formato exclusivo que exige FullCalendar
      const endObj = new Date(endDate + 'T00:00:00'); // Forzamos parseo local
      endObj.setDate(endObj.getDate() + 1); // Sumamos 1 día exacto
      
      const yyyy = endObj.getFullYear();
      const mm = String(endObj.getMonth() + 1).padStart(2, '0');
      const dd = String(endObj.getDate()).padStart(2, '0');
      const nextDayEnd = `${yyyy}-${mm}-${dd}`;

      // 2. Pasamos ÚNICAMENTE los strings 'YYYY-MM-DD'. 
      // Sin la 'Z' ni horas, FullCalendar lo interpreta como "día flotante"
      // y pinta la caja perfectamente independientemente del huso horario.
      return {
        start: startDate, // ej: "2026-04-20"
        end: nextDayEnd,  // ej: "2026-04-25" (exclusivo)
        allDay: true,
      };
    }

    // Para eventos con horas (Horario Especial), se mantiene el formato local
    const start = `${startDate}T${String(b.hora_inicio).slice(0, 5)}:00`;
    const end = `${startDate}T${String(b.hora_fin).slice(0, 5)}:00`;
    return { start, end, allDay: false };
  }, [toDateOnly]);

  const calendarColors = useMemo(() => {
    return {
      primary: negocio?.color_primario || '#3B82F6',
      secondary: negocio?.color_secundario || '#EF4444',
      accent: negocio?.color_acento || '#10B981',
    };
  }, [negocio]);

  const employeeById = useMemo(() => {
    const map = new Map();
    for (const emp of employees) map.set(emp.id, emp);
    return map;
  }, [employees]);

  const calendarEvents = useMemo(() => {
    return blockages.map((b) => {
      const timing = computeEventTiming(b);
      const isGlobal = !b.empleado_id;
      const empName = b.empleado_nombre || employeeById.get(b.empleado_id)?.nombre;
      const title = isGlobal ? `🏢 ${b.titulo}` : `${empName || 'Empleado'}: ${b.titulo}`;
      const color = isGlobal ? calendarColors.secondary : calendarColors.primary;

      return {
        id: b.id,
        title,
        backgroundColor: color,
        borderColor: color,
        textColor: '#ffffff',
        extendedProps: { blockage: b },
        ...timing,
      };
    });
  }, [blockages, calendarColors.primary, calendarColors.secondary, employeeById, computeEventTiming]);

  const openEditModal = (blockage) => {
    setError('');
    setEditing(blockage);
    setFormData({
      negocioId: formData.negocioId,
      empleadoId: blockage.empleado_id || null,
      fecha_inicio: toDateOnly(blockage.fecha_inicio),
      fecha_fin: toDateOnly(blockage.fecha_fin),
      hora_inicio: blockage.hora_inicio ? String(blockage.hora_inicio).slice(0, 5) : '',
      hora_fin: blockage.hora_fin ? String(blockage.hora_fin).slice(0, 5) : '',
      titulo: blockage.titulo || '',
      descripcion: blockage.descripcion || '',
    });
    setShowModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    // Backend has no update endpoint. We implement edit as delete + create.
    if (!editing) {
      await submitBlockage(formData);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await adminApi.deleteBlockage(user.token, editing.id);
      await adminApi.createBlockage(user.token, {
        ...formData,
        empleadoId: formData.empleadoId || null,
        hora_inicio: formData.hora_inicio ? formData.hora_inicio : null,
        hora_fin: formData.hora_fin ? formData.hora_fin : null,
        activo: true,
      });
      setShowModal(false);
      setEditing(null);
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || 'Error al editar bloqueo');
    } finally {
      setSaving(false);
    }
  };

  const positionQuickMenu = (x, y) => {
    if (!overlayTargetRef.current) return;
    overlayTargetRef.current.style.left = `${x}px`;
    overlayTargetRef.current.style.top = `${y}px`;
  };

  const onCalendarSelect = (selectInfo) => {
    setError('');
    
    // Center popover in viewport
    const x = window.innerWidth / 2 - 160; // 160 = half of popover width (320)
    const y = window.innerHeight / 2 - 200; // 200 = half of approximate popover height

    // FullCalendar returns end as exclusive for allDay selections
    const startStr = toDateOnly(selectInfo.start);
    const endStr = selectInfo.allDay
      ? toDateOnly(new Date(selectInfo.end.getTime() - 24 * 60 * 60 * 1000))
      : toDateOnly(selectInfo.end);

    const isSingleDay = startStr === endStr;

    positionQuickMenu(x, y);
    setQuickMenu({ x, y, startStr, endStr, allDay: selectInfo.allDay, isSingleDay });
    setQuickEmployeeId('');
    setQuickSpecialHoursEnabled(false);
    setShowQuickMenu(true);

    const api = calendarRef.current?.getApi();
    if (api) api.unselect();
  };

  const createQuickBlockage = async ({ mode }) => {
    const base = {
      negocioId: formData.negocioId,
      empleadoId: null,
      fecha_inicio: quickMenu.startStr,
      fecha_fin: quickMenu.endStr,
      hora_inicio: '',
      hora_fin: '',
      titulo: 'Bloqueo Programado',
      descripcion: '',
    };

    if (mode === 'business') {
      await submitBlockage({
        ...base,
        empleadoId: null,
        hora_inicio: '',
        hora_fin: '',
      }, { hideModal: true });
      return;
    }

    if (mode === 'employee') {
      if (!quickEmployeeId) {
        setError('Selecciona un empleado');
        return;
      }
      await submitBlockage({
        ...base,
        empleadoId: quickEmployeeId,
        hora_inicio: '',
        hora_fin: '',
        titulo: 'Bloqueo Programado',
      }, { hideModal: true });
      return;
    }

    if (mode === 'special_hours') {
      if (!quickMenu.isSingleDay) {
        setError('El horario especial solo está disponible para 1 día');
        return;
      }
      if (!quickHoraInicio || !quickHoraFin) {
        setError('Indica hora inicio y hora fin');
        return;
      }
      await submitBlockage({
        ...base,
        empleadoId: null,
        fecha_fin: quickMenu.startStr,
        hora_inicio: quickHoraInicio,
        hora_fin: quickHoraFin,
        titulo: 'Horario Especial',
      }, { hideModal: true });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES');
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
          <Button variant="outline-secondary" className="me-3" as={Link} to="/admin">
            <ArrowLeft />
          </Button>
          <h2 className="fw-bold mb-0">Bloqueos de Agenda</h2>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus className="me-2" /> Nuevo bloqueo
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <div ref={overlayTargetRef} style={{ position: 'fixed', left: 0, top: 0, width: 1, height: 1, zIndex: 1050 }} />

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={isMobile ? 'dayGridMonth' : 'dayGridMonth'}
            headerToolbar={isMobile ? {
              left: 'prev,next',
              center: 'title',
              right: 'today',
            } : {
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            footerToolbar={isMobile ? {
              left: 'dayGridMonth',
              center: 'timeGridWeek',
              right: 'timeGridDay',
            } : undefined}
            buttonText={{
              today: 'today',
              month: 'month',
              week: 'week',
              day: 'day',
            }}
            weekends
            expandRows
            height="auto"
            aspectRatio={isMobile ? 0.85 : 1.35}
            selectable
            selectMirror
            dayMaxEvents
            eventDisplay="block"
            eventDidMount={(info) => {
              if (info.el) {
                info.el.style.borderRadius = '8px';
                info.el.style.padding = '2px 6px';
                info.el.style.fontSize = isMobile ? '12px' : '13px';
              }
            }}
            select={onCalendarSelect}
            events={calendarEvents}
            eventClick={(clickInfo) => {
              const blockage = clickInfo.event.extendedProps?.blockage;
              if (!blockage) return;

              const action = window.prompt('Acción: escribe "eliminar" o "editar"', 'editar');
              if (!action) return;

              if (action.toLowerCase() === 'eliminar') {
                handleDelete(blockage.id);
              } else if (action.toLowerCase() === 'editar') {
                openEditModal(blockage);
              }
            }}
          />

          <Overlay
            show={showQuickMenu}
            target={overlayTargetRef.current}
            placement="auto"
            containerPadding={12}
            rootClose
            onHide={() => setShowQuickMenu(false)}
          >
            <Popover id="blockage-quick-menu" style={{ minWidth: 320 }}>
              <Popover.Header as="h3">Crear bloqueo</Popover.Header>
              <Popover.Body>
                <div className="mb-2">
                  <div className="small text-muted">{quickMenu.startStr}{quickMenu.endStr && quickMenu.endStr !== quickMenu.startStr ? ` → ${quickMenu.endStr}` : ''}</div>
                </div>

                <div className="d-grid gap-2">
                  <Button
                    variant="danger"
                    onClick={() => createQuickBlockage({ mode: 'business' })}
                    disabled={saving}
                  >
                    Cerrar Negocio
                  </Button>

                  <div>
                    <Form.Label className="small mb-1">Cerrar Empleado</Form.Label>
                    <div className="d-flex gap-2">
                      <Form.Select
                        value={quickEmployeeId}
                        onChange={(e) => setQuickEmployeeId(e.target.value)}
                        disabled={saving}
                      >
                        <option value="">Selecciona empleado…</option>
                        {employees
                          .filter((e) => e.activo !== false)
                          .map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                          ))}
                      </Form.Select>
                      <Button
                        variant="primary"
                        onClick={() => createQuickBlockage({ mode: 'employee' })}
                        disabled={saving}
                      >
                        Crear
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex align-items-center justify-content-between">
                      <Form.Label className="small mb-1">Horario Especial (solo 1 día)</Form.Label>
                      <Form.Check
                        type="switch"
                        checked={quickSpecialHoursEnabled}
                        onChange={(e) => setQuickSpecialHoursEnabled(e.target.checked)}
                        disabled={saving || !quickMenu.isSingleDay}
                      />
                    </div>

                    {quickSpecialHoursEnabled && (
                      <Row className="g-2">
                        <Col>
                          <Form.Control
                            type="time"
                            value={quickHoraInicio}
                            onChange={(e) => setQuickHoraInicio(e.target.value)}
                            disabled={saving}
                          />
                        </Col>
                        <Col>
                          <Form.Control
                            type="time"
                            value={quickHoraFin}
                            onChange={(e) => setQuickHoraFin(e.target.value)}
                            disabled={saving}
                          />
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="success"
                            onClick={() => createQuickBlockage({ mode: 'special_hours' })}
                            disabled={saving}
                          >
                            Crear
                          </Button>
                        </Col>
                      </Row>
                    )}
                  </div>
                </div>
              </Popover.Body>
            </Popover>
          </Overlay>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-semibold">Lista (resumen)</div>
            <div className="small text-muted">Se mantiene como respaldo</div>
          </div>

          <div className="d-none d-md-block">
            <Table responsive hover size="sm">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Período</th>
                  <th>Horario</th>
                  <th>Empleado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {blockages.map((blockage) => (
                  <tr key={blockage.id}>
                    <td>
                      <strong>{blockage.titulo}</strong>
                      {blockage.descripcion && (
                        <div className="text-muted small">{blockage.descripcion}</div>
                      )}
                    </td>
                    <td>
                      {formatDate(blockage.fecha_inicio)} - {formatDate(blockage.fecha_fin)}
                    </td>
                    <td>
                      {blockage.hora_inicio ? (
                        `${blockage.hora_inicio.substring(0, 5)} - ${blockage.hora_fin.substring(0, 5)}`
                      ) : (
                        <Badge bg="info">Todo el día</Badge>
                      )}
                    </td>
                    <td>
                      {blockage.empleado_nombre || <Badge bg="secondary">Todo el negocio</Badge>}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => openEditModal(blockage)}
                      >
                        <Pencil />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(blockage.id)}>
                        <Trash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="d-md-none">
            <div className="d-grid gap-2">
              {blockages.map((blockage) => (
                <Card key={blockage.id} className="border">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start gap-2">
                      <div style={{ minWidth: 0 }}>
                        <div className="fw-semibold text-truncate">{blockage.titulo}</div>
                        <div className="small text-muted">
                          {formatDate(blockage.fecha_inicio)} - {formatDate(blockage.fecha_fin)}
                        </div>
                        <div className="mt-1 d-flex flex-wrap gap-2">
                          {blockage.hora_inicio ? (
                            <Badge bg="info">{blockage.hora_inicio.substring(0, 5)} - {blockage.hora_fin.substring(0, 5)}</Badge>
                          ) : (
                            <Badge bg="info">Todo el día</Badge>
                          )}
                          {blockage.empleado_nombre ? (
                            <Badge bg="primary">{blockage.empleado_nombre}</Badge>
                          ) : (
                            <Badge bg="secondary">Todo el negocio</Badge>
                          )}
                        </div>
                        {blockage.descripcion ? (
                          <div className="small text-muted mt-2">{blockage.descripcion}</div>
                        ) : null}
                      </div>

                      <div className="d-flex gap-2 flex-shrink-0">
                        <Button variant="outline-primary" size="sm" onClick={() => openEditModal(blockage)}>
                          <Pencil />
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(blockage.id)}>
                          <Trash />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
          
          {blockages.length === 0 && (
            <p className="text-muted text-center py-4">No hay bloqueos registrados</p>
          )}
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Editar bloqueo' : 'Nuevo bloqueo'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={editing ? handleSaveEdit : handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Título *</Form.Label>
              <Form.Control
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </Form.Group>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha inicio *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha fin *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Hora inicio (opcional)</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Hora fin (opcional)</Form.Label>
                  <Form.Control
                    type="time"
                    value={formData.hora_fin}
                    onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Empleado afectado (opcional)</Form.Label>
              <Form.Select
                value={formData.empleadoId || ''}
                onChange={(e) => setFormData({...formData, empleadoId: e.target.value || null})}
              >
                <option value="">Todo el negocio</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              {editing ? 'Guardar cambios' : 'Crear bloqueo'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}

export default AdminBlockages;
