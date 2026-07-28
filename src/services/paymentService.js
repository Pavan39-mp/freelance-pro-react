import api from './api';

export const createPayment = (data) => api.post('/payments', data);
export const getPayments = () => api.get('/payments');
export const getInvoicePayments = (invoiceId) => api.get(`/payments/invoice/${invoiceId}`);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
