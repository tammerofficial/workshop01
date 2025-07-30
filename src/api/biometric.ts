import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface BiometricAttendanceParams {
  start_date?: string;
  end_date?: string;
  worker_id?: string | number;
  page?: number;
  page_size?: number;
}

export interface ExportAttendanceParams {
  start_date?: string;
  end_date?: string;
  format: 'excel' | 'csv' | 'pdf';
}

// Get biometric attendance data
export const getBiometricAttendance = (params?: BiometricAttendanceParams) => {
  return axios.get(`${API_URL}/biometric/attendance`, { params });
};

// Get biometric workers
export const getBiometricWorkers = () => {
  return axios.get(`${API_URL}/biometric/workers`);
};

// Get biometric transactions
export const getBiometricTransactions = (params?: any) => {
  return axios.get(`${API_URL}/biometric/transactions`, { params });
};

// Import transactions from biometric device
export const importBiometricTransactions = (data: any) => {
  return axios.post(`${API_URL}/biometric/import`, data);
};

// Export attendance data
export const exportAttendance = (params: ExportAttendanceParams) => {
  return axios.get(`${API_URL}/biometric/export`, { 
    params,
    responseType: 'blob'
  });
};

// Delete biometric transaction
export const deleteBiometricTransaction = (id: number) => {
  return axios.delete(`${API_URL}/biometric/transactions/${id}`);
};

// Update biometric transaction
export const updateBiometricTransaction = (id: number, data: any) => {
  return axios.put(`${API_URL}/biometric/transactions/${id}`, data);
};

// Get biometric terminals
export const getBiometricTerminals = () => {
  return axios.get(`${API_URL}/biometric/terminals`);
};

// Get biometric statistics
export const getBiometricStats = (params?: any) => {
  return axios.get(`${API_URL}/biometric/stats`, { params });
};