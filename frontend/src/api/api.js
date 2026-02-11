import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Employee APIs ───────────────────────────────────────────

export const getEmployees = async () => {
  const response = await api.get('/api/employees/');
  return response.data;
};

export const getEmployee = async (employeeId) => {
  const response = await api.get(`/api/employees/${employeeId}`);
  return response.data;
};

export const createEmployee = async (data) => {
  const response = await api.post('/api/employees/', data);
  return response.data;
};

export const deleteEmployee = async (employeeId) => {
  const response = await api.delete(`/api/employees/${employeeId}`);
  return response.data;
};

// ─── Attendance APIs ─────────────────────────────────────────

export const getAttendance = async (params = {}) => {
  const response = await api.get('/api/attendance/', { params });
  return response.data;
};

export const getEmployeeAttendance = async (employeeId, params = {}) => {
  const response = await api.get(`/api/attendance/employee/${employeeId}`, { params });
  return response.data;
};

export const getEmployeeAttendanceSummary = async (employeeId) => {
  const response = await api.get(`/api/attendance/employee/${employeeId}/summary`);
  return response.data;
};

export const markAttendance = async (data) => {
  const response = await api.post('/api/attendance/', data);
  return response.data;
};

// ─── Dashboard APIs ──────────────────────────────────────────

export const getDashboardSummary = async () => {
  const response = await api.get('/api/dashboard/summary');
  return response.data;
};

export default api;
