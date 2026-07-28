import React, { useState } from 'react';
import { useClients } from '../../context/ClientContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AddClientForm = ({ onClose, isEmbedded = false, initialData = null }) => {
  const { addClient, updateClient } = useClients();
  const [formData, setFormData] = useState(initialData || {
    name: '',
    company: '',
    email: '',
    phone: '',
    website: '',
    industry: 'Technology',
    country: '',
    status: 'Active',
    priority: 'Normal',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Client Name is required');
      return;
    }

    try {
      if (initialData) {
        await updateClient(initialData.id, formData);
      } else {
        await addClient(formData);
      }
      onClose();
    } catch (err) {
      // Error is handled inside Context
    }
  };

  const formContent = (
    <div className={`flex flex-col bg-surface-container-high rounded-3xl overflow-hidden w-full ${!isEmbedded ? 'max-h-[90vh] border border-outline-variant/20 shadow-2xl' : 'h-full'}`}>

      {!isEmbedded && (
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10 shrink-0">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{initialData ? 'Edit Client' : 'Add New Client'}</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <form id="add-client-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <Input
              label="Client Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Company *"
              name="company"
              value={formData.company}
              onChange={handleChange}
            />
            <Input
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Phone Number *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Input
              label="Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
            />
            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />

            <Input
              type="select"
              label="Industry"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              options={["Technology", "Healthcare", "Finance", "Education", "E-commerce", "Other"]}
            />

            <Input
              type="select"
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={["Active", "Inactive", "Lead"]}
            />

            <Input
              type="select"
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              options={[
                { value: 'High', label: 'High' },
                { value: 'Normal', label: 'Medium' },
                { value: 'Low', label: 'Low' }
              ]}
            />
          </div>

          <Input
            type="textarea"
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </form>
      </div>

      <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low shrink-0">
        <Button
          variant="outline"
          onClick={() => setFormData(initialData || { name: '', company: '', email: '', phone: '', website: '', industry: 'Technology', country: '', status: 'Active', priority: 'Medium', notes: '' })}
          className="mr-auto"
        >
          Reset
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="add-client-form">
          {initialData ? 'Save Changes' : 'Save Client'}
        </Button>
      </div>
    </div>
  );

  if (isEmbedded) return formContent;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl flex flex-col justify-center max-h-[90vh]">
        {formContent}
      </div>
    </div>
  );
};

export default AddClientForm;
