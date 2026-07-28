import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useInvoices } from '../../context/InvoiceContext';
import { Calendar, Clock, IndianRupee, Target, Trash2, MessageSquare, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUser } from '../../context/UserContext';
import api from '../../services/api';
import CreateInvoiceForm from '../forms/CreateInvoiceForm';
import { useNavigate } from 'react-router-dom';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';

const INVOICE_STATUS_COLORS = {
    'Draft': 'text-on-surface-variant bg-surface-container',
    'Sent': 'text-primary bg-primary/10',
    'Paid': 'text-tertiary bg-tertiary/10',
    'Partially Paid': 'text-secondary bg-secondary/10',
    'Overdue': 'text-error bg-error/10',
    'Cancelled': 'text-on-surface-variant bg-surface-container line-through',
};

const ProjectOverviewTab = ({ project }) => {
    const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
    const [projectInvoice, setProjectInvoice] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const { updateProject } = useProjects();
    const { invoices, addInvoice } = useInvoices() || {};
    const projectId = project?.id || project?._id;
    const projectInvoices = (invoices || []).filter(i => {
        const pid = i.project?._id || i.projectId || i.project;
        return pid === project?.id || pid === project?._id;
    });
    const totalBilled = projectInvoices.reduce((s, i) => s + i.total, 0);
    const totalPaid = projectInvoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
    const outstanding = totalBilled - totalPaid;
    const { user } = useUser();
    const navigate = useNavigate();
    const [status, setStatus] = useState(project.status || 'To Do');
    const [priority, setPriority] = useState(project.priority || 'Normal');
    const [progress, setProgress] = useState(project.progress || 0);
    const [budget, setBudget] = useState(project.budget || '');
    const [hourlyRate, setHourlyRate] = useState(project.hourlyRate || '');
    const [dueDate, setDueDate] = useState(project.dueDate || project.deadline || '');
    const [description, setDescription] = useState(project.description || '');

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);

    const fetchComments = async () => {
        if (!projectId) return;
        setCommentsLoading(true);
        try {
            const res = await api.get(`/projects/${projectId}/comments`);
            if (res?.success) {
                setComments(res.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCommentsLoading(false);
        }
    };

    const fetchProjectInvoice = async () => {
        if (!projectId) return;
        setInvoiceLoading(true);
        try {
            const res = await api.get('/invoices', { params: { limit: 1, project: projectId } });
            const list = res?.invoices || [];
            setProjectInvoice(list[0] || null);
        } catch (err) {
            console.error('Failed to fetch project invoice', err);
        } finally {
            setInvoiceLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        fetchProjectInvoice();
    }, [projectId]);

    useEffect(() => {
        setStatus(project.status || 'To Do');
        setPriority(project.priority || 'Normal');
        setProgress(project.progress || 0);
        setBudget(project.budget || '');
        setHourlyRate(project.hourlyRate || '');
        setDueDate(project.dueDate || project.deadline || '');
        setDescription(project.description || '');
    }, [project]);

    const saveField = async (field, value) => {
        try {
            let cleanValue = value;
            if (field === 'budget' || field === 'hourlyRate' || field === 'progress') {
                cleanValue = value === '' ? 0 : Number(value);
            }

            const updates = { [field]: cleanValue };
            if (field === 'dueDate') {
                updates.deadline = cleanValue;
            }

            await updateProject(project.id || project._id, updates);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update project field');
        }
    };

    const handleProgressChange = (val) => {
        const num = Math.min(100, Math.max(0, Number(val) || 0));
        setProgress(num);
    };

    const handleProgressBlur = () => {
        if (progress !== project.progress) {
            saveField('progress', progress);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || commentsLoading) return;
        try {
            const res = await api.post(`/projects/${projectId}/comments`, { text: newComment });
            if (res?.success) {
                setComments(prev => [...prev, res.data]);
                setNewComment('');
                toast.success('Comment added');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to post comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            const res = await api.delete(`/projects/${projectId}/comments/${commentId}`);
            if (res?.success) {
                setComments(prev => prev.filter(c => c._id !== commentId));
                toast.success('Comment deleted');
            }
        } catch (err) {
            toast.error(err?.message || 'Failed to delete comment');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Editable Fields Grid */}
            <div className="grid grid-cols-2 gap-4">

                {/* Status */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Status</label>
                    <select
                        value={status}
                        disabled={user?.role === 'client'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setStatus(val);
                            saveField('status', val);
                        }}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Priority</label>
                    <select
                        value={priority}
                        disabled={user?.role === 'client'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setPriority(val);
                            saveField('priority', val);
                        }}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        <option value="High">High</option>
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                    </select>
                </div>

                {/* Project Financials */}
                <div className="col-span-1 border-t border-outline-variant/10 pt-4 mt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">Financial Summary</label>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-surface-container rounded-xl">
                            <p className="text-[10px] font-bold text-on-surface-variant mb-1">Total Billed</p>
                            <p className="text-body-md font-bold text-on-surface">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBilled)}</p>
                        </div>
                        <div className="p-3 bg-surface-container rounded-xl">
                            <p className="text-[10px] font-bold text-on-surface-variant mb-1">Total Paid</p>
                            <p className="text-body-md font-bold text-tertiary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalPaid)}</p>
                        </div>
                        <div className="p-3 bg-surface-container rounded-xl col-span-2">
                            <p className="text-[10px] font-bold text-on-surface-variant mb-1 flex justify-between">
                                Outstanding
                                {outstanding === 0 && totalBilled > 0 && <span className="text-tertiary">Fully Paid</span>}
                            </p>
                            <p className="text-title-sm font-bold text-error">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(outstanding)}</p>
                        </div>
                    </div>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Agreed Budget (₹)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-sm">₹</span>
                        <input
                            type="number"
                            value={budget}
                            disabled
                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 pl-7 pr-3 focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Hourly Rate */}
                <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Hourly Rate (₹)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-sm">₹</span>
                        <input
                            type="number"
                            value={hourlyRate}
                            disabled={user?.role === 'client'}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            onBlur={() => {
                                if (Number(hourlyRate) !== Number(project.hourlyRate)) {
                                    saveField('hourlyRate', hourlyRate);
                                }
                            }}
                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 pl-7 pr-3 focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Due Date</label>
                    <input
                        type="date"
                        value={dueDate ? dueDate.split('T')[0] : ''}
                        disabled={user?.role === 'client'}
                        onChange={(e) => {
                            const val = e.target.value;
                            setDueDate(val);
                            saveField('dueDate', val);
                        }}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Progress Slider + Input */}
                <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex justify-between">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            disabled={user?.role === 'client'}
                            onChange={(e) => setProgress(Number(e.target.value))}
                            onMouseUp={() => {
                                if (progress !== project.progress) {
                                    saveField('progress', progress);
                                }
                            }}
                            onTouchEnd={() => {
                                if (progress !== project.progress) {
                                    saveField('progress', progress);
                                }
                            }}
                            className="flex-1 accent-primary h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
                        />
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={progress}
                            disabled={user?.role === 'client'}
                            onChange={(e) => handleProgressChange(e.target.value)}
                            onBlur={handleProgressBlur}
                            className="w-16 bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-1.5 px-2 text-center focus:ring-1 focus:ring-primary focus:outline-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Description</label>
                <AutoResizeTextarea
                    value={description}
                    disabled={user?.role === 'client'}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => {
                        if (description !== project.description) {
                            saveField('description', description);
                        }
                    }}
                    rows={3}
                    maxHeight={224}
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none resize-none disabled:bg-surface-container-low disabled:cursor-not-allowed"
                    placeholder="Enter project description..."
                />
            </div>

            <hr className="border-outline-variant/10" />

            {/* Payment Document / Invoice Section — visible to both Client and Freelancer */}
            {(user?.role === 'client' && project.createdBy) || (user?.role === 'freelancer' && project.platformClient) ? (
                <>
                    {/* Assigned Freelancer card — clients only */}
                    {user?.role === 'client' && project.createdBy && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Assigned Freelancer</h4>

                            <div className="p-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 flex flex-col sm:flex-row gap-5 items-start">
                                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-primary/20 bg-surface-variant flex items-center justify-center text-primary font-bold text-xl">
                                    {project.createdBy.avatar ? (
                                        <img src={project.createdBy.avatar} alt="Freelancer avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        (project.createdBy.fullName || project.createdBy.name || 'F').charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-title-md font-bold text-on-surface leading-tight">{project.createdBy.fullName || project.createdBy.name}</h3>
                                    {project.createdBy.title && <p className="text-body-sm text-on-surface-variant">{project.createdBy.title}</p>}

                                    {(!project.createdBy.hasOwnProperty('isPublicProfile') || project.createdBy.isPublicProfile) && (
                                        <div className="mt-3 space-y-2 pt-2 border-t border-outline-variant/10">
                                            {project.createdBy.bio && (
                                                <div>
                                                    <p className="text-[9px] uppercase font-bold text-on-surface-variant mb-0.5">Bio</p>
                                                    <p className="text-body-sm text-on-surface/90 leading-relaxed">{project.createdBy.bio}</p>
                                                </div>
                                            )}
                                            {project.createdBy.skills && (
                                                <div>
                                                    <p className="text-[9px] uppercase font-bold text-on-surface-variant mb-0.5">Skills</p>
                                                    <p className="text-body-sm text-on-surface/90">{project.createdBy.skills}</p>
                                                </div>
                                            )}
                                            {project.createdBy.experience && (
                                                <div>
                                                    <p className="text-[9px] uppercase font-bold text-on-surface-variant mb-0.5">Experience</p>
                                                    <p className="text-body-sm text-on-surface/90">{project.createdBy.experience}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Create Invoice button — only when no invoice exists yet */}
                                {!invoiceLoading && !projectInvoice && (
                                    <button
                                        onClick={() => setIsCreatingInvoice(true)}
                                        className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[11px] font-bold font-label-caps uppercase active:scale-95 duration-200 shrink-0 self-start sm:self-center"
                                    >
                                        Create Payment Doc
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoice card — shown when an invoice exists (both roles) */}
                    {!invoiceLoading && projectInvoice && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" /> Payment Document
                            </h4>
                            <div className="p-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/10 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-bold text-on-surface text-body-md">{projectInvoice.invoiceNumber || `INV-${projectInvoice._id?.slice(-6).toUpperCase()}`}</p>
                                        <p className="text-[10px] text-on-surface-variant mt-0.5">
                                            Created {projectInvoice.createdAt ? new Date(projectInvoice.createdAt).toLocaleDateString('en-IN') : '—'}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${INVOICE_STATUS_COLORS[projectInvoice.status] || 'text-on-surface-variant bg-surface-container'}`}>
                                        {projectInvoice.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/10 text-body-sm">
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-on-surface-variant mb-0.5">Total Amount</p>
                                        <p className="font-bold text-on-surface">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(projectInvoice.total || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-on-surface-variant mb-0.5">Paid</p>
                                        <p className="font-bold text-tertiary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(projectInvoice.paidAmount || 0)}</p>
                                    </div>
                                    {projectInvoice.dueDate && (
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-on-surface-variant mb-0.5">Due Date</p>
                                            <p className="text-on-surface">{new Date(projectInvoice.dueDate).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    )}
                                    {projectInvoice.paidAt && (
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-on-surface-variant mb-0.5">Payment Date</p>
                                            <p className="text-tertiary">{new Date(projectInvoice.paidAt).toLocaleDateString('en-IN')}</p>
                                        </div>
                                    )}
                                </div>
                                {user?.role === 'client' && (
                                    <button onClick={() => navigate('/client/invoices')} className="text-[10px] text-on-surface-variant flex items-center gap-1.5 pt-1 hover:text-primary transition-colors">
                                        <CheckCircle className="w-3 h-3 text-tertiary" />
                                        Existing invoice — view it in Invoice Management.
                                    </button>
                                )}
                                {user?.role === 'freelancer' && (
                                    <p className="text-[10px] text-on-surface-variant flex items-center gap-1.5 pt-1">
                                        <AlertCircle className="w-3 h-3 text-primary" />
                                        Payment document issued by client — view full details in the Invoices section.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Invoice loading placeholder */}
                    {invoiceLoading && (
                        <div className="h-16 rounded-2xl bg-surface-container-low/40 animate-pulse" />
                    )}

                    {/* CreateInvoiceForm modal */}
                    {isCreatingInvoice && (
                        <CreateInvoiceForm
                            onClose={() => setIsCreatingInvoice(false)}
                            isEmbedded={false}
                            prefillProject={project.id || project._id}
                            onCreated={(inv) => {
                                setProjectInvoice(inv);
                                setIsCreatingInvoice(false);
                            }}
                        />
                    )}
                    <hr className="border-outline-variant/10" />
                </>
            ) : null}


            {/* Read-Only Stats */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Project Info</h4>

                <div className="grid grid-cols-2 gap-4 text-body-sm bg-surface-container-low/40 p-4 rounded-2xl border border-outline-variant/10">
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Project Name</p>
                        <p className="text-on-surface font-medium mt-0.5 truncate">{project.title}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Client</p>
                        <p className="text-on-surface font-medium mt-0.5 truncate">
                            {project.clientName || (project.client && typeof project.client === 'object' ? project.client.fullName || project.client.name : project.client) || '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Start Date</p>
                        <p className="text-on-surface font-medium mt-0.5">{project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Estimated Hours</p>
                        <p className="text-on-surface font-medium mt-0.5">{project.estimatedHours || 0}h</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Worked Hours</p>
                        <p className="text-on-surface font-medium mt-0.5">{project.workedHours || 0}h</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Remaining Hours</p>
                        <p className="text-on-surface font-medium mt-0.5">{project.remainingHours || 0}h</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Created Date</p>
                        <p className="text-on-surface font-medium mt-0.5">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-on-surface-variant">Last Updated</p>
                        <p className="text-on-surface font-medium mt-0.5">{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '—'}</p>
                    </div>
                </div>
            </div>

            <hr className="border-outline-variant/10" />

            {/* Comments / Notes System */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-primary" /> Discussion & Notes
                </h4>

                {/* Add Comment Form */}
                {user?.role !== 'client' && (
                    <form onSubmit={handleAddComment} className="flex gap-2">
                        <AutoResizeTextarea
                            placeholder="Add a comment or note..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={1}
                            maxHeight={120}
                            className="flex-1 bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-[11px] font-bold font-label-caps uppercase active:scale-95 duration-200 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            Post
                        </button>
                    </form>
                )}

                {/* Comments List */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {commentsLoading ? (
                        <p className="text-body-sm text-on-surface-variant text-center py-2 animate-pulse">Loading discussion...</p>
                    ) : comments.length > 0 ? (
                        comments.map(c => (
                            <div key={c._id} className="p-3 bg-auto bg-surface-container-low rounded-xl border border-outline-variant/10 group flex justify-between items-start gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[11px] font-bold text-on-surface truncate">{c.userName || 'You'}</span>
                                        <span className="text-[9px] text-on-surface-variant shrink-0">{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-body-sm text-on-surface break-words whitespace-pre-wrap leading-relaxed">{c.content}</p>
                                </div>
                                {user?.role !== 'client' && (
                                    <button
                                        onClick={() => handleDeleteComment(c._id)}
                                        type="button"
                                        className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all p-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 bg-surface-container-low/20 rounded-xl border border-outline-variant/10 border-dashed">
                            <MessageSquare className="w-6 h-6 mx-auto mb-1 opacity-20 text-on-surface-variant" />
                            <p className="text-body-sm text-on-surface-variant font-medium">No comments or notes posted yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectOverviewTab;
