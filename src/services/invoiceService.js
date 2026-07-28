import api from './api';

export const getInvoices = (params = {}) => api.get('/invoices', { params });
export const getRevenueSummary = (params = {}) => api.get('/invoices/summary', { params });
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const getClientInvoices = (clientId) => api.get(`/invoices/client/${clientId}`);
export const createInvoice = (data) => api.post('/invoices', data);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`);
export const duplicateInvoice = (id) => api.post(`/invoices/${id}/duplicate`);
export const changeStatus = (id, status, paidAmount) => api.patch(`/invoices/${id}/status`, { status, paidAmount });
