import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Form, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { ArrowLeft, Save, Clock, Person } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function AdminSchedules() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [businessSchedules, setBusinessSchedules] = useState({});
  const [employeeSchedules, setEmployeeSchedules] = useState({});
  const [originalBusinessSchedules, setOriginalBusinessSchedules] = useState({});
  const [originalEmployeeSchedules, setOriginalEmployeeSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [negocioId, setNegocioId] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load admin negocios to get negocioId
      const negociosData = await adminApi.getMyNegocios(user.token);
      
      if (negociosData.length > 0) {
        const negocio = negociosData[0];
        setNegocioId(negocio.id);
        
        // Load business schedules
        const businessData = await adminApi.getBusinessSchedules(user.token, negocio.id);
        const businessSchedulesMap = {};
        businessData.forEach(schedule => {
          businessSchedulesMap[schedule.dia_semana] = {
            hora_apertura: schedule.hora_apertura || '',
            hora_cierre: schedule.hora_cierre || '',
            activo: schedule.activo !== false
          };
        });
        setBusinessSchedules(businessSchedulesMap);
        setOriginalBusinessSchedules(JSON.parse(JSON.stringify(businessSchedulesMap)));
        
        // Load employees
        const employeesData = await adminApi.getEmployees(user.token, { negocio_id: negocio.id });
        setEmployees(employeesData);
        
        if (employeesData.length > 0) {
          setSelectedEmployee(employeesData[0].id);
        }
      } else {
        setError('No tienes negocios asignados');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeSchedules = async (employeeId) => {
    if (!employeeId) return;
    
    try {
      const data = await adminApi.getEmployeeSchedules(user.token, employeeId);
      const schedulesMap = {};
      data.forEach(schedule => {
        schedulesMap[schedule.dia_semana] = {
          hora_apertura: schedule.hora_apertura || '',
          hora_cierre: schedule.hora_cierre || '',
          activo: schedule.activo !== false
        };
      });
      setEmployeeSchedules(schedulesMap);
      setOriginalEmployeeSchedules(JSON.parse(JSON.stringify(schedulesMap)));
    } catch (err) {
      console.error('Error loading employee schedules:', err);
      setError('Error al cargar los horarios del empleado');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeSchedules(selectedEmployee);
    }
  }, [selectedEmployee]);

  const handleBusinessScheduleChange = (day, field, value) => {
    setBusinessSchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleEmployeeScheduleChange = (day, field, value) => {
    setEmployeeSchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const saveBusinessSchedules = async () => {
    try {
      setSaving(true);
      setError('');
      
      const schedulesToSave = [];
      DAYS.forEach((day, index) => {
        const schedule = businessSchedules[index];
        if (schedule.activo && schedule.hora_apertura && schedule.hora_cierre) {
          schedulesToSave.push({
            dia_semana: index,
            hora_apertura: schedule.hora_apertura,
            hora_cierre: schedule.hora_cierre,
            activo: schedule.activo
          });
        }
      });

      await adminApi.updateBusinessSchedules(user.token, negocioId, schedulesToSave);
      setOriginalBusinessSchedules(JSON.parse(JSON.stringify(businessSchedules)));
      setSuccess('Horarios del negocio guardados correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving business schedules:', err);
      setError('Error al guardar los horarios del negocio');
    } finally {
      setSaving(false);
    }
  };

  const saveEmployeeSchedules = async () => {
    if (!selectedEmployee) return;
    
    try {
      setSaving(true);
      setError('');
      
      const schedulesToSave = [];
      DAYS.forEach((day, index) => {
        const schedule = employeeSchedules[index];
        if (schedule.activo && schedule.hora_apertura && schedule.hora_cierre) {
          schedulesToSave.push({
            dia_semana: index,
            hora_apertura: schedule.hora_apertura,
            hora_cierre: schedule.hora_cierre,
            activo: schedule.activo
          });
        }
      });

      await adminApi.updateEmployeeSchedules(user.token, selectedEmployee, schedulesToSave);
      setOriginalEmployeeSchedules(JSON.parse(JSON.stringify(employeeSchedules)));
      setSuccess('Horarios del empleado guardados correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving employee schedules:', err);
      setError('Error al guardar los horarios del empleado');
    } finally {
      setSaving(false);
    }
  };

  const hasBusinessChanges = () => {
    return JSON.stringify(businessSchedules) !== JSON.stringify(originalBusinessSchedules);
  };

  const hasEmployeeChanges = () => {
    return JSON.stringify(employeeSchedules) !== JSON.stringify(originalEmployeeSchedules);
  };

  const renderScheduleTable = (schedules, onChange, isBusiness = false) => (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Día</th>
          <th>Activo</th>
          <th>Apertura</th>
          <th>Cierre</th>
        </tr>
      </thead>
      <tbody>
        {DAYS.map((day, index) => (
          <tr key={day}>
            <td><strong>{day}</strong></td>
            <td>
              <Form.Check
                type="checkbox"
                checked={schedules[index]?.activo || false}
                onChange={(e) => onChange(index, 'activo', e.target.checked)}
              />
            </td>
            <td>
              <Form.Control
                type="time"
                value={schedules[index]?.hora_apertura || ''}
                onChange={(e) => onChange(index, 'hora_apertura', e.target.value)}
                disabled={!schedules[index]?.activo}
              />
            </td>
            <td>
              <Form.Control
                type="time"
                value={schedules[index]?.hora_cierre || ''}
                onChange={(e) => onChange(index, 'hora_cierre', e.target.value)}
                disabled={!schedules[index]?.activo}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Cargando horarios...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Link to="/admin" className="btn btn-outline-secondary me-3">
            <ArrowLeft className="me-1" /> Volver
          </Link>
          <h2 className="mb-0">Gestión de Horarios</h2>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Tabs defaultActiveKey="business" className="mb-4">
        <Tab eventKey="business" title={
          <span><Clock className="me-2" />Horarios del Negocio</span>
        }>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">
                Horarios de Apertura del Negocio
              </Card.Title>
              <Card.Text className="text-muted mb-0">
                Estos son los horarios generales en los que tu negocio está abierto.
                Los clientes solo podrán reservar dentro de estos horarios.
              </Card.Text>
            </Card.Header>
            <Card.Body>
              {renderScheduleTable(businessSchedules, handleBusinessScheduleChange, true)}
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="primary"
                  onClick={saveBusinessSchedules}
                  disabled={saving || !hasBusinessChanges()}
                >
                  <Save className="me-2" />
                  {saving ? 'Guardando...' : 'Guardar Horarios del Negocio'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="employees" title={
          <span><Person className="me-2" />Horarios de Empleados</span>
        }>
          <Card>
            <Card.Header>
              <Card.Title className="mb-0">Horarios por Empleado</Card.Title>
              <Card.Text className="text-muted mb-0">
                Configura horarios específicos para cada empleado.
                Estos horarios deben estar dentro de los horarios del negocio.
              </Card.Text>
            </Card.Header>
            <Card.Body>
              {employees.length > 0 ? (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Seleccionar Empleado:</Form.Label>
                    <Form.Select
                      value={selectedEmployee || ''}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  {selectedEmployee && (
                    <>
                      {renderScheduleTable(employeeSchedules, handleEmployeeScheduleChange)}
                      <div className="d-flex justify-content-end mt-3">
                        <Button
                          variant="primary"
                          onClick={saveEmployeeSchedules}
                          disabled={saving || !hasEmployeeChanges()}
                        >
                          <Save className="me-2" />
                          {saving ? 'Guardando...' : 'Guardar Horarios del Empleado'}
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Alert variant="info">
                  No hay empleados registrados. Primero crea empleados para poder configurar sus horarios.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default AdminSchedules;
