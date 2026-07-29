import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useInvoices } from '../../context/InvoiceContext';
import { useClients } from '../../context/ClientContext';
import { useProjects } from '../../context/ProjectContext';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';
import { formatCurrency } from '../../services/api';

const CreateInvoiceForm = ({ onClose, isEmbedded = false, prefillProject = null, onCreated = null }) => {
  const { user } = useUser();
  const { addInvoice } = useInvoices();
  const { clients } = useClients();
  const { projects } = useProjects();
  const selectedProject = projects.find(project => (project._id || project.id) === formData.project);
  const assignedFreelancer = selectedProject?.createdBy;
  const freelancerName = assignedFreelancer?.fullName || assignedFreelancer?.name || 'Assigned from project';

  const [formData, setFormData] = useState({
    project: prefillProject || '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    taxRate: 0,
    discount: 0,
    notes: ''
  });

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }] }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const taxAmount = sub * (formData.taxRate / 100);
    return sub + taxAmount - formData.discount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      toast.error('Project is required');
      return;
    }
    if (!formData.dueDate || new Date(formData.dueDate) < new Date(formData.issueDate)) {
      toast.error('Due date must be on or after the invoice date');
      return;
    }

    try {
      const inv = await addInvoice({
        project: formData.project,
        status: 'Draft',
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: formData.items.map(item => {
          const quantity = Number(item.quantity);
          const rate = Number(item.rate);
          return { ...item, quantity, rate, amount: Number((quantity * rate).toFixed(2)) };
        }),
        taxRate: Number(formData.taxRate) || 0,
        discount: Number(formData.discount) || 0,
        notes: formData.notes
      });
      toast.success('Invoice created successfully');
      if (onCreated) onCreated(inv);
      else onClose();
    } catch (err) {
      // api.js interceptor rejects with response.data: { message, invoice, ... }
      const existing = err?.invoice;
      if (err?.status === 409 && existing) {
        toast('An invoice already exists for this project.', { icon: 'ℹ️' });
        if (onCreated) onCreated(existing);
        else onClose();
      } else {
        toast.error(err?.message || 'Failed to create invoice');
      }
    }
  };

  const formContent = (
    <div className="flex flex-col h-full bg-surface-container-high rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20 w-full">
      {!isEmbedded && (
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 shrink-0">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Create Invoice</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Input
              type="select"
              label="Project (Required)"
              value={formData.project}
              onChange={e => setFormData(p => ({ ...p, project: e.target.value }))}
              placeholder="Select Project"
              disabled={!!prefillProject}
              required
              options={projects.filter(p => user?.role === 'client' || (!formData.client || p.client === formData.client)).map(p => ({ label: p.title || p.name, value: p._id || p.id }))}
            />

            <Input
              label="Freelancer"
              value={formData.project ? freelancerName : 'Select a project first'}
              readOnly
              disabled
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Input
                type="date"
                label="Invoice Date"
                value={formData.issueDate}
                onChange={e => setFormData(p => ({ ...p, issueDate: e.target.value }))}
                required
              />
              <Input
                type="date"
                label="Due Date"
                value={formData.dueDate}
                onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase ml-1 tracking-widest font-bold">Line Items</label>
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start w-full">
                  <div className="flex-1">
                    <AutoResizeTextarea
                      placeholder="Item Description"
                      value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      rows={1}
                      maxHeight={120}
                      className="w-full bg-surface-secondary border border-border rounded-[0.75rem] py-[0.625rem] px-[1.25rem] text-text font-body-md placeholder:text-placeholder-color focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={e => handleItemChange(index, 'rate', Number(e.target.value))}
                      min="0"
                      required
                    />
                  </div>
                  <div className="w-24 pt-2.5 text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Line total</p>
                    <p className="text-body-sm font-bold text-primary">{formatCurrency((Number(item.quantity) || 0) * (Number(item.rate) || 0))}</p>
                  </div>
                  <button type="button" onClick={() => removeItem(index)} className="mt-2.5 p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors" disabled={formData.items.length === 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full items-start">
            <div className="col-span-2">
              <Input
                type="textarea"
                label="Notes / Terms"
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <Input
              type="number"
              label="Tax (%)"
              value={formData.taxRate}
              onChange={e => setFormData(p => ({ ...p, taxRate: Number(e.target.value) }))}
              min="0"
            />
            <Input
              type="number"
              label="Discount (%)"
              value={formData.discount}
              onChange={e => setFormData(p => ({ ...p, discount: Number(e.target.value) }))}
              min="0"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/10">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-1">Total Amount</p>
              <p className="text-display-sm font-bold text-on-surface">{formatCurrency(calculateTotal())}</p>
            </div>
          </div>

        </form>
      </div>

      <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low shrink-0">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="create-invoice-form">
          Save Invoice
        </Button>
      </div>
    </div>
  );

  if (isEmbedded) return formContent;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh]">
        {formContent}
      </div>
    </div>
  );
};

export default CreateInvoiceForm;
