const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

async function fetchWithAuth(url, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    const errorObj = new Error(error.message || `Error ${response.status}`);
    errorObj.status = response.status;
    errorObj.data = error;
    throw errorObj;
  }

  return response.json();
}

// Public API
export const publicApi = {
  getBusinesses: () => fetchWithAuth('/public/negocios'),
  getBusiness: (slug) => fetchWithAuth(`/public/${slug}`),
  getServices: (slug) => fetchWithAuth(`/public/${slug}/servicios`),
  getAvailability: (slug, date, serviceIds) => {
    const params = new URLSearchParams({ date });
    serviceIds.forEach(id => params.append('serviceIds', id));
    return fetchWithAuth(`/public/${slug}/availability?${params}`);
  },
  createBooking: (slug, data) => fetchWithAuth(`/public/${slug}/bookings`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  confirmBooking: (token) => fetchWithAuth(`/public/confirm/${token}`, {
    method: 'POST',
  }),
  resendConfirmation: (email, name, date, startTime) => fetchWithAuth('/public/resend-confirmation', {
    method: 'POST',
    body: JSON.stringify({ email, name, date, startTime }),
  }),
};

// Admin API
export const adminApi = {
  login: (email, password) => fetchWithAuth('/admin/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  
  // Negocios
  getNegocios: (token) => fetchWithAuth('/admin/negocios', {}, token),
  updateNegocio: (token, negocioId, data) => fetchWithAuth(`/admin/negocios/${negocioId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token),
  uploadLogo: (token, negocioId, file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    return fetch(`${API_BASE}/admin/negocios/${negocioId}/upload-logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
  },
  
  // Services
  getServices: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/servicios${query ? `?${query}` : ''}`, {}, token);
  },
  createService: (token, data) => fetchWithAuth('/admin/servicios', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
  updateService: (token, id, data) => fetchWithAuth(`/admin/servicios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token),
  deleteService: (token, id) => fetchWithAuth(`/admin/servicios/${id}`, {
    method: 'DELETE',
  }, token),
  
  // Negocios
  getMyNegocios: (token) => fetchWithAuth('/admin/negocios', {}, token),
  
  // Employees
  getEmployees: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/empleados${query ? `?${query}` : ''}`, {}, token);
  },
  createEmployee: (token, data) => fetchWithAuth('/admin/empleados', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
  updateEmployee: (token, id, data) => fetchWithAuth(`/admin/empleados/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token),
  deleteEmployee: (token, id) => fetchWithAuth(`/admin/empleados/${id}`, {
    method: 'DELETE',
  }, token),
  
  // Employee Services
  getEmployeeServices: (token, employeeId) => fetchWithAuth(`/admin/empleado-servicio/${employeeId}`, {}, token),
  assignService: (token, data) => fetchWithAuth('/admin/empleado-servicio', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
  unassignService: (token, employeeId, serviceId) => fetchWithAuth(`/admin/empleado-servicio/${employeeId}/${serviceId}`, {
    method: 'DELETE',
  }, token),
  
  // Schedules
  getBusinessSchedules: (token, negocioId) => fetchWithAuth(`/admin/horarios/negocio/${negocioId}`, {}, token),
  updateBusinessSchedules: (token, negocioId, data) => fetchWithAuth(`/admin/horarios/negocio/${negocioId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token),
  getEmployeeSchedules: (token, employeeId) => fetchWithAuth(`/admin/horarios/empleado/${employeeId}`, {}, token),
  updateEmployeeSchedules: (token, employeeId, data) => fetchWithAuth(`/admin/horarios/empleado/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token),
  
  // Blockages
  getBlockages: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/bloqueos${query ? `?${query}` : ''}`, {}, token);
  },
  createBlockage: (token, data) => fetchWithAuth('/admin/bloqueos', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
  deleteBlockage: (token, id) => fetchWithAuth(`/admin/bloqueos/${id}`, {
    method: 'DELETE',
  }, token),

  // Business Schedules
  getBusinessSchedules: (token, negocioId) => fetchWithAuth(`/admin/business-schedules?negocio_id=${negocioId}`, {}, token),
  updateBusinessSchedules: (token, negocioId, schedules) => fetchWithAuth(`/admin/business-schedules/${negocioId}`, {
    method: 'PUT',
    body: JSON.stringify({ schedules }),
  }, token),
  
  // Employee Schedules  
  getEmployeeSchedules: (token, employeeId) => fetchWithAuth(`/admin/employee-schedules/${employeeId}`, {}, token),
  updateEmployeeSchedules: (token, employeeId, schedules) => fetchWithAuth(`/admin/employee-schedules/${employeeId}`, {
    method: 'PUT',
    body: JSON.stringify({ schedules }),
  }, token),
  
  // Appointments
  getAppointments: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/citas${query ? `?${query}` : ''}`, {}, token);
  },
  updateAppointmentStatus: (token, id, estado) => fetchWithAuth(`/admin/citas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  }, token),

  // Superadmin API
  getDashboard: (token) => fetchWithAuth('/superadmin/dashboard', {}, token),
  
  // Administradores
  getAdministradores: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/superadmin/administradores${query ? `?${query}` : ''}`, {}, token);
  },
  createAdministrador: (token, data) => fetchWithAuth('/superadmin/administradores', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
  getAdministrador: (token, id) => fetchWithAuth(`/superadmin/administradores/${id}`, {}, token),
  updateAdministrador: (token, id, data) => fetchWithAuth(`/superadmin/administradores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token),
  deactivateAdministrador: (token, id) => fetchWithAuth(`/superadmin/administradores/${id}/desactivar`, {
    method: 'PATCH',
  }, token),
  
  // Negocios
  getSuperadminNegocios: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/superadmin/negocios${query ? `?${query}` : ''}`, {}, token);
  },
  createSuperadminNegocio: (token, data) => fetchWithAuth('/superadmin/negocios', {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
  getSuperadminNegocio: (token, id) => fetchWithAuth(`/superadmin/negocios/${id}`, {}, token),
  updateSuperadminNegocio: (token, id, data) => fetchWithAuth(`/superadmin/negocios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, token),
  deactivateSuperadminNegocio: (token, id) => fetchWithAuth(`/superadmin/negocios/${id}/desactivar`, {
    method: 'PATCH',
  }, token),
  
  // Asignación de admins a negocios
  getAdminsByNegocio: (token, negocioId) => fetchWithAuth(`/superadmin/negocios/${negocioId}/admins`, {}, token),
  asignarAdmins: (token, negocioId, data) => fetchWithAuth(`/superadmin/negocios/${negocioId}/asignar-admin`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, token),
  
  // Estadísticas por negocio
  getNegocioEstadisticas: (token, negocioId) => fetchWithAuth(`/superadmin/negocios/${negocioId}/estadisticas`, {}, token),
};
