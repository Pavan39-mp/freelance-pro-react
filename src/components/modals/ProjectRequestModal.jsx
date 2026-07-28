import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';

const ProjectRequestModal = ({ isOpen, onClose, onSubmit, freelancerName }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        deadline: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'budget') {
            setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9.]/g, '') }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            budget: Number(formData.budget)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-surface-container rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Request Project from {freelancerName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-label-md font-label-md text-on-surface-variant mb-1">Project Title <span className="text-error">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g. E-commerce Website Development"
                            className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-label-md font-label-md text-on-surface-variant mb-1">Project Description <span className="text-error">*</span></label>
                        <AutoResizeTextarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            maxHeight={224}
                            placeholder="Describe your project requirements and scope..."
                            className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-label-md font-label-md text-on-surface-variant mb-1">Budget (₹) <span className="text-error">*</span></label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-on-surface-variant">₹</span>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    placeholder="50000"
                                    className="w-full pl-8 pr-4 py-3 bg-surface-container-high/50 border border-outline-variant/30 rounded-xl text-on-surface focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-label-md font-label-md text-on-surface-variant mb-1">Deadline <span className="text-error">*</span></label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]} // Block past dates natively
                                className="w-full bg-surface-container-high/50 border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface tracking-wide focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 flex-col-reverse sm:flex-row">
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={onClose}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full sm:w-auto"
                        >
                            Send Request
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectRequestModal;
