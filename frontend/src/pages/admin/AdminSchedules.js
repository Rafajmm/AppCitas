import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import { ArrowLeft, Save } from 'react-bootstrap-icons';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/api';

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function AdminSchedules() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [negocioId, setNegocioId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [scheduleType, setScheduleType] = useState('employee');
  const [schedules, setSchedules] = useState({});
  const [originalSchedules, setOriginalSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadEmployees = async () => {
    try {
      const negociosData = await adminApi.getMyNegocios(user.token);
      
      if (negociosData.length > 0) {
        const negId = negociosData[0].id;
        setNegocioId(negId);
        
        const data = await adminApi.getEmployees(user.token);
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployee(data[0]);
          loadSchedules('employee', data[0].id, negId);
        } else {
          setScheduleType('business');
          loadSchedules('business', null, negId);
        }
      } else {
        setError('No tienes negocios asignados');
        setLoading(false);
      }
    } catch (err) {
      setError('Error al cargar empleados');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [user?.token]);

  const loadSchedules = async (type, employeeId, negId) => {
    setLoading(true);
    try {
      let scheduleMap = {};
      
      if (type === 'business') {
        const busSchedules = await adminApi.getBusinessSchedules(user.token, negId);
        for (let i = 0; i < 7; i++) {
          const busSchedule = busSchedules.find(s => s.dia_semana === i);
          scheduleMap[i] = busSchedule || {
            dia_semana: i,
            hora_apertura: '09:00',
            hora_cierre: '18:00',
            activo: true,
          };
        }
      } else {
        const [empSchedules, busSchedules] = await Promise.all([
          adminApi.getEmployeeSchedules(user.token, employeeId),
          adminApi.getBusinessSchedules(user.token, negId),
        ]);
        
        for (let i = 0; i < 7; i++) {
          const empSchedule = empSchedules.find(s => s.dia_semana === i);
          const busSchedule = busSchedules.find(s => s.dia_semana === i);
          
          scheduleMap[i] = empSchedule || {
            dia_semana: i,
            hora_apertura: busSchedule?.hora_apertura?.substring(0, 5) || '09:00',
            hora_cierre: busSchedule?.hora_cierre?.substring(0, 5) || '18:00',
            activo: busSchedule?.activo !== false,
          };
        }
      }
      
      setSchedules(scheduleMap);
      setOriginalSchedules(JSON.parse(JSON.stringify(scheduleMap)));
    } catch (err) {
      setError('Error al cargar horarios');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTypeChange = (type) => {
    setScheduleType(type);
    if (type === 'business') {
      loadSchedules('business', null, negocioId);
    } else if (selectedEmployee) {
      loadSchedules('employee', selectedEmployee.id, negocioId);
    }
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    setSelectedEmployee(employee);
    loadSchedules('employee', employeeId, employee.negocio_id);
  };

  const handleScheduleChange = (day, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      }
    }));
  };

  const handleSave = async () => {
    if (scheduleType === 'employee' && !selectedEmployee) {
      setError('Por favor selecciona un empleado');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const horarios = Object.values(schedules);
      
      if (scheduleType === 'business') {
        await adminApi.updateBusinessSchedules(user.token, negocioId, { horarios });
        setSuccess('Horarios del negocio guardados correctamente');
      } else {
        await adminApi.updateEmployeeSchedules(user.token, selectedEmployee.id, { horarios });
        setSuccess('Horarios del empleado guardados correctamente');
      }
      setOriginalSchedules(JSON.parse(JSON.stringify(schedules)));
    } catch (err) {
      setError(err.message || 'Error al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(schedules) !== JSON.stringify(originalSchedules);

  if (loading && !negocioId) {
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
          <h2 className="fw-bold mb-0">Horarios</h2>
        </div>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={saving || !hasChanges}
        >
          {saving ? <Spinner size="sm" className="me-2" /> : <Save className="me-2" />}
          Guardar cambios
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex gap-3 mb-3">
            <Form.Check
              type="radio"
              name="scheduleType"
              id="schedule-business"
              label="Horario del negocio"
              checked={scheduleType === 'business'}
              onChange={() => handleScheduleTypeChange('business')}
            />
            <Form.Check
              type="radio"
              name="scheduleType"
              id="schedule-employee"
              label="Horario de empleados"
              checked={scheduleType === 'employee'}
              onChange={() => handleScheduleTypeChange('employee')}
            />
          </div>
          
          {scheduleType === 'employee' && employees.length > 0 && (
            <Form.Group>
              <Form.Label>Seleccionar empleado</Form.Label>
              <Form.Select 
                value={selectedEmployee?.id || ''}
                onChange={(e) => handleEmployeeChange(e.target.value)}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
          
          {scheduleType === 'employee' && employees.length === 0 && (
            <Alert variant="warning">No hay empleados disponibles</Alert>
          )}
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive>
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
                  <tr key={index}>
                    <td className="fw-bold">{day}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={schedules[index]?.activo || false}
                        onChange={(e) => handleScheduleChange(index, 'activo', e.target.checked)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        value={schedules[index]?.hora_apertura || '09:00'}
                        onChange={(e) => handleScheduleChange(index, 'hora_apertura', e.target.value)}
                        disabled={!schedules[index]?.activo}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        value={schedules[index]?.hora_cierre || '18:00'}
                        onChange={(e) => handleScheduleChange(index, 'hora_cierre', e.target.value)}
                        disabled={!schedules[index]?.activo}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default AdminSchedules;
