import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as invoiceService from '../services/invoiceService';
import * as paymentService from '../services/paymentService';
import { useUser } from './UserContext';

const InvoiceContext = createContext();

export const InvoiceProvider = ({ children }) => {
  const { user } = useUser();
  const [invoices, setInvoices] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadInvoices = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await invoiceService.getInvoices({ limit: 200 });
      setInvoices(data?.invoices || []);
    } catch (err) {
      console.error('InvoiceContext: load failed', err);
      setInvoices([]);
    } finally {
      setLoading(false);
      setIsLoaded(true);
    }
  }, [user]);

  const loadRevenueSummary = useCallback(async (params = {}) => {
    if (!user) return;
    try {
      const data = await invoiceService.getRevenueSummary(params);
      setRevenueSummary(data);
    } catch (err) {
      console.error('InvoiceContext: revenue summary failed', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadInvoices();
      loadRevenueSummary();
    } else {
      setInvoices([]);
      setRevenueSummary(null);
      setIsLoaded(false);
    }
  }, [user, loadInvoices, loadRevenueSummary]);

  const refresh = async () => {
    await Promise.all([loadInvoices(), loadRevenueSummary()]);
  };

  const addInvoice = async (data) => {
    const inv = await invoiceService.createInvoice(data);
    setInvoices(prev => [inv, ...prev]);
    await loadRevenueSummary();
    return inv;
  };

  const updateInvoice = async (id, data) => {
    const inv = await invoiceService.updateInvoice(id, data);
    setInvoices(prev => prev.map(i => (i._id === id ? inv : i)));
    await loadRevenueSummary();
    return inv;
  };

  const deleteInvoice = async (id) => {
    await invoiceService.deleteInvoice(id);
    setInvoices(prev => prev.filter(i => i._id !== id));
    await loadRevenueSummary();
  };

  const duplicateInvoice = async (id) => {
    const inv = await invoiceService.duplicateInvoice(id);
    setInvoices(prev => [inv, ...prev]);
    return inv;
  };

  const changeStatus = async (id, status, paidAmount) => {
    const inv = await invoiceService.changeStatus(id, status, paidAmount);
    setInvoices(prev => prev.map(i => (i._id === id ? inv : i)));
    await loadRevenueSummary();
    return inv;
  };

  const getClientInvoices = (clientId) => invoiceService.getClientInvoices(clientId);

  // Payment actions — create/delete and then refresh invoice list + revenue summary
  const recordPayment = async (paymentData) => {
    const payment = await paymentService.createPayment(paymentData);
    // After recording, reload invoices so paidAmount + status update
    await Promise.all([loadInvoices(), loadRevenueSummary()]);
    return payment;
  };

  const removePayment = async (paymentId) => {
    await paymentService.deletePayment(paymentId);
    await Promise.all([loadInvoices(), loadRevenueSummary()]);
  };

  return (
    <InvoiceContext.Provider value={{
      invoices, revenueSummary, isLoaded, loading,
      addInvoice, updateInvoice, deleteInvoice, duplicateInvoice, changeStatus,
      getClientInvoices, refresh, loadRevenueSummary,
      recordPayment, removePayment
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => useContext(InvoiceContext);
