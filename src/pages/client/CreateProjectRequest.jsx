import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { createMarketplaceProjectRequest } from '../../services/projectRequestService';

const initialForm = {
  title: '',
  description: '',
  category: '',
  skills: '',
  minimumBudget: '',
  maximumBudget: '',
  deadline: '',
  projectType: 'fixed-price'
};

const CreateProjectRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(current => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const skills = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);
    const minimumBudget = Number(formData.minimumBudget);
    const maximumBudget = Number(formData.maximumBudget);

    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim() || skills.length === 0 || !formData.deadline || !formData.projectType) {
      toast.error('Please complete all required fields.');
      return;
    }
    if (!Number.isFinite(minimumBudget) || !Number.isFinite(maximumBudget) || minimumBudget < 0 || maximumBudget < 0) {
      toast.error('Please enter a valid budget range.');
      return;
    }
    if (minimumBudget > maximumBudget) {
      toast.error('Minimum budget cannot be greater than maximum budget.');
      return;
    }
    if (new Date(`${formData.deadline}T23:59:59`) <= new Date()) {
      toast.error('Deadline must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      await createMarketplaceProjectRequest({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        skills,
        budget: { min: minimumBudget, max: maximumBudget },
        deadline: formData.deadline,
        projectType: formData.projectType
      });
      toast.success('Project request created successfully.');
      navigate('/client/project-requests');
    } catch (error) {
      toast.error(error.message || 'Failed to create project request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="font-title-lg font-bold text-on-surface">Create Project Request</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">Describe the work you need and publish it to the marketplace.</p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
          <Input type="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} rows={5} required />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input label="Category" name="category" value={formData.category} onChange={handleChange} required />
            <Input label="Required Skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" required />
          </div>

          <div className="space-y-3">
            <p className="font-label-caps text-label-caps text-on-surface-variant">Budget Range *</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input type="number" label="Minimum Budget" name="minimumBudget" min="0" value={formData.minimumBudget} onChange={handleChange} required />
              <Input type="number" label="Maximum Budget" name="maximumBudget" min="0" value={formData.maximumBudget} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input type="date" label="Deadline" name="deadline" value={formData.deadline} onChange={handleChange} required />
            <Input
              type="select"
              label="Project Type"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              options={[
                { value: 'fixed-price', label: 'Fixed Price' },
                { value: 'hourly', label: 'Hourly' }
              ]}
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Project Request'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProjectRequest;
