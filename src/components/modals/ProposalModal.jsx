import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';
import { createProposal } from '../../services/projectProposalService';

const ProposalModal = ({ project, onClose, onSubmitted }) => {
  const [formData, setFormData] = useState({ proposedBudget: '', deliveryDays: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (submitting) return;
    const proposedBudget = Number(formData.proposedBudget);
    const deliveryDays = Number(formData.deliveryDays);
    const message = formData.message.trim();
    if (!Number.isFinite(proposedBudget) || proposedBudget <= 0) {
      toast.error('Proposed budget is required.');
      return;
    }
    if (!Number.isInteger(deliveryDays) || deliveryDays < 1) {
      toast.error('Expected delivery days must be a positive whole number.');
      return;
    }
    if (!message) {
      toast.error('Cover message is required.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await createProposal({ projectRequest: project._id, proposedBudget, deliveryDays, message });
      toast.success('Proposal submitted successfully.');
      onSubmitted(response.data);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface-container shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant/20 p-6">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Send Proposal</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-variant"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">Project</label>
            <input value={project.title} readOnly className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high/50 px-4 py-3 text-on-surface opacity-80" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-label-md text-on-surface-variant">Your Proposed Budget *</label>
              <div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">₹</span><input type="number" name="proposedBudget" min="0.01" step="0.01" required value={formData.proposedBudget} onChange={handleChange} placeholder="25000" className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high/50 py-3 pl-8 pr-4 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" /></div>
            </div>
            <div>
              <label className="mb-1 block text-label-md text-on-surface-variant">Expected Delivery Days *</label>
              <input type="number" name="deliveryDays" min="1" step="1" required value={formData.deliveryDays} onChange={handleChange} placeholder="30" className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high/50 px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-label-md text-on-surface-variant">Cover Message *</label>
            <AutoResizeTextarea name="message" required maxLength={2000} rows={5} maxHeight={240} value={formData.message} onChange={handleChange} placeholder="I can complete this project with clean architecture and responsive UI." className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-high/50 px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Proposal'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;
