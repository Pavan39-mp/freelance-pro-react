import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, ChevronDown, Save } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v || 0);

const EMPTY_ITEM = { description: '', taskId: '', hours: 0, rate: 0, quantity: 1, amount: 0 };

const defaultForm = () => ({
    clientId: '',
    projectId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    items: [{ ...EMPTY_ITEM }],
    taxRate: 18,
    discount: 0,
    notes: '',
    terms: 'Payment due within 30 days of invoice date.'
});

const calcItem = (item) => {
    const hrs = parseFloat(item.hours) || 0;
    const qty = parseFloat(item.quantity) || 1;
    const rate = parseFloat(item.rate) || 0;
    // If hours > 0, amount = hours * rate; otherwise amount = qty * rate
    return parseFloat((hrs > 0 ? hrs * rate : qty * rate).toFixed(2));
};

const calcTotals = (items, taxRate, discount) => {
    const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
    const taxAmount = parseFloat(((subtotal * (parseFloat(taxRate) || 0)) / 100).toFixed(2));
    const total = parseFloat((subtotal + taxAmount - (parseFloat(discount) || 0)).toFixed(2));
    return { subtotal: parseFloat(subtotal.toFixed(2)), taxAmount, total };
};

const InvoiceFormModal = ({ invoice, onSave, onClose, clientManaged = false }) => {
    const { clients } = useClients();
    const { projects } = useProjects();
    const { tasks } = useTasks();
    const [form, setForm] = useState(defaultForm());
    const [saving, setSaving] = useState(false);
    const [totals, setTotals] = useState({ subtotal: 0, taxAmount: 0, total: 0 });

    // Populate form when editing
    useEffect(() => {
        if (invoice) {
            setForm({
                clientId: invoice.client?._id || invoice.client || '',
                projectId: invoice.project?._id || invoice.project || '',
                issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                items: invoice.items?.length ? invoice.items.map(i => ({ ...i, taskId: i.taskId?._id || i.taskId || '' })) : [{ ...EMPTY_ITEM }],
                taxRate: invoice.taxRate ?? 18,
                discount: invoice.discount ?? 0,
                notes: invoice.notes || '',
                terms: invoice.terms || ''
            });
        }
    }, [invoice]);

    // Recalculate totals whenever items/tax/discount change
    useEffect(() => {
        setTotals(calcTotals(form.items, form.taxRate, form.discount));
    }, [form.items, form.taxRate, form.discount]);

    const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const updateItem = (idx, field, rawValue) => {
        setForm(prev => {
            const items = [...prev.items];
            items[idx] = { ...items[idx], [field]: rawValue };
            items[idx].amount = calcItem(items[idx]);
            return { ...prev, items };
        });
    };

    const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
    const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

    // Populate item from a selected task
    const fillFromTask = (idx, taskId) => {
        const task = tasks.find(t => (t._id || t.id) === taskId);
        if (!task) { updateItem(idx, 'taskId', taskId); return; }
        setForm(prev => {
            const items = [...prev.items];
            items[idx] = {
                ...items[idx],
                taskId,
                description: task.title || task.name || '',
                hours: task.workedHours || task.estimatedHours || 0,
                rate: 1500,
                quantity: 1,
            };
            items[idx].amount = calcItem(items[idx]);
            return { ...prev, items };
        });
    };

    const filteredProjects = clientManaged
        ? projects
        : form.clientId
        ? projects.filter(p => (p.client?._id || p.client?.id || p.clientId || p.client) === form.clientId)
        : projects;

    const filteredTasks = form.projectId
        ? tasks.filter(t => (t.projectId?._id || t.projectId) === form.projectId)
        : tasks;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!clientManaged && !form.clientId) { alert('Please select a client.'); return; }
        if (!form.projectId) { alert('Please select a project.'); return; }
        if (!form.dueDate) { alert('Please set a due date.'); return; }
        setSaving(true);
        try {
            const payload = {
                project: form.projectId || null,
                issueDate: form.issueDate,
                dueDate: form.dueDate,
                items: form.items.map(item => ({ ...item, taskId: item.taskId || null })),

                taxRate: parseFloat(form.taxRate) || 0,
                discount: parseFloat(form.discount) || 0,
                notes: form.notes,
                terms: form.terms,
                ...totals
            };
            await onSave(clientManaged ? payload : { ...payload, client: form.clientId });
            onClose();
        } catch (err) {
            alert(err?.response?.data?.message || err.message || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const inputCls = 'w-full bg-surface-container-high border border-outline-variant/20 rounded-lg text-body-sm text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:outline-none';
    const labelCls = 'block text-[10px] font-bold tracking-wider text-on-surface-variant mb-1';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-4xl max-h-[92vh] bg-surface-container rounded-2xl border border-outline-variant/20 shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/60">
                    <h2 className="font-headline-sm text-on-surface">{invoice ? 'Edit Invoice' : 'Create Invoice'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-6">

                        {/* Client & Project */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!clientManaged && <div>
                                <label className={labelCls}>Client *</label>
                                <div className="relative">
                                    <select value={form.clientId} onChange={e => { setField('clientId', e.target.value); setField('projectId', ''); }} className={inputCls + ' pr-8 appearance-none cursor-pointer'} required>
                                        <option value="">— Select Client —</option>
                                        {clients.map(c => <option key={c._id} value={c._id}>{c.fullName}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                </div>
                            </div>}
                            <div>
                                <label className={labelCls}>Project {clientManaged ? '*' : '(Optional)'}</label>
                                <div className="relative">
                                    <select value={form.projectId} onChange={e => setField('projectId', e.target.value)} className={inputCls + ' pr-8 appearance-none cursor-pointer'}>
                                        <option value="">— Select Project —</option>
                                        {filteredProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Invoice Date *</label>
                                <input type="date" value={form.issueDate} onChange={e => setField('issueDate', e.target.value)} className={inputCls} required />
                            </div>
                            <div>
                                <label className={labelCls}>Due Date *</label>
                                <input type="date" value={form.dueDate} onChange={e => setField('dueDate', e.target.value)} className={inputCls} required />
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-on-surface">Line Items</h3>
                                <button type="button" onClick={addItem} className="text-primary text-body-sm flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-bold">
                                    <Plus className="w-4 h-4" /> Add Item
                                </button>
                            </div>
                            <div className="space-y-3">
                                {/* Table header */}
                                <div className="hidden md:grid grid-cols-12 gap-2 px-3 pb-1" style={{ width: "100%" }}>
                                    {['Task (opt)', 'Description', 'Hrs', 'Qty', 'Rate (₹)', 'Amount', ''].map((h, i) => (
                                        <span key={i} className={`text-[10px] font-bold tracking-wider text-on-surface-variant ${
                                          i === 0 ? 'col-span-2 pl-3' : 
                                          i === 1 ? 'col-span-2 pl-3' : 
                                          i === 2 ? 'col-span-1 pl-3' :
                                          i === 3 ? 'col-span-1 pl-3' :
                                          i === 4 ? 'col-span-3 pl-2' : 
                                          i === 5 ? 'col-span-2 text-right pr-2' : 
                                          'col-span-1'
                                        }`}>{h}</span>
                                    ))}
                                </div>
                                {form.items.map((item, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-surface-container-high rounded-xl border border-outline-variant/10">
                                        {/* Task picker */}
                                        <div className="col-span-12 md:col-span-2">
                                            <select value={item.taskId || ''} onChange={e => fillFromTask(idx, e.target.value)} className={inputCls + ' text-[11px] pr-1 appearance-none'}>
                                                <option value="">No Task</option>
                                                {filteredTasks.map(t => <option key={t._id || t.id} value={t._id || t.id}>{t.title}</option>)}
                                            </select>
                                        </div>
                                        {/* Description */}
                                        <div className="col-span-12 md:col-span-2">
                                            <AutoResizeTextarea placeholder="Description *" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className={inputCls} rows={1} maxHeight={120} required />
                                        </div>
                                        {/* Hours */}
                                        <div className="col-span-6 md:col-span-1">
                                            <input type="number" min="0" step="0.5" placeholder="Hrs" value={item.hours} onChange={e => updateItem(idx, 'hours', e.target.value)} className={inputCls} />
                                        </div>
                                        {/* Qty */}
                                        <div className="col-span-6 md:col-span-1">
                                            <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className={inputCls} />
                                        </div>
                                        {/* Rate */}
                                        <div className="col-span-6 md:col-span-3 text-left">
                                            <input type="number" min="0" placeholder="Rate" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} className={inputCls + ' !pl-2 !pr-8 min-w-[70px]'} />
                                        </div>
                                        {/* Amount */}
                                        <div className="col-span-4 md:col-span-2 text-right pr-2">
                                            <span className="font-bold text-primary truncate max-w-full inline-block">{INR(item.amount)}</span>
                                        </div>
                                        {/* Remove */}
                                        <div className="col-span-2 md:col-span-1 flex justify-end md:justify-center">
                                            <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-error hover:bg-error/10 rounded-lg disabled:opacity-30" disabled={form.items.length === 1}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Tax Rate (%)</label>
                                        <input type="number" min="0" max="100" value={form.taxRate} onChange={e => setField('taxRate', e.target.value)} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Discount (₹)</label>
                                        <input type="number" min="0" value={form.discount} onChange={e => setField('discount', e.target.value)} className={inputCls} />
                                    </div>
                                </div>
                                <div className="bg-surface-container-high rounded-xl p-4 space-y-1.5 mt-2">
                                    <div className="flex justify-between text-body-sm text-on-surface-variant"><span>Subtotal</span><span>{INR(totals.subtotal)}</span></div>
                                    {parseFloat(form.taxRate) > 0 && <div className="flex justify-between text-body-sm text-on-surface-variant"><span>Tax ({form.taxRate}%)</span><span>{INR(totals.taxAmount)}</span></div>}
                                    {parseFloat(form.discount) > 0 && <div className="flex justify-between text-body-sm text-error"><span>Discount</span><span>−{INR(form.discount)}</span></div>}
                                    <div className="flex justify-between font-bold text-on-surface border-t border-outline-variant/20 pt-2 mt-2"><span>Total</span><span className="text-primary">{INR(totals.total)}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Notes & Terms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Notes</label>
                                <AutoResizeTextarea rows="3" value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Optional notes to client..." className={inputCls} maxHeight={192} />
                            </div>
                            <div>
                                <label className={labelCls}>Terms & Conditions</label>
                                <AutoResizeTextarea rows="3" value={form.terms} onChange={e => setField('terms', e.target.value)} placeholder="Payment terms..." className={inputCls} maxHeight={192} />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/60 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-body-sm hover:bg-surface-variant/50 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold text-body-sm flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-60">
                            <Save className="w-4 h-4" />{saving ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceFormModal;
