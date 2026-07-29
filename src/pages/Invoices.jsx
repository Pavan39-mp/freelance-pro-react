import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Search, Download, Send, CheckCircle, Clock, XCircle,
    MoreVertical, Copy, Trash2, Edit2, AlertCircle, ChevronDown,
    ReceiptIndianRupee, IndianRupee, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';
import { useUser } from '../context/UserContext';
import InvoiceFormModal from '../components/invoices/InvoiceFormModal';
import CreateInvoiceForm from '../components/forms/CreateInvoiceForm';
import InvoiceDetailsModal from '../components/invoices/InvoiceDetailsModal';
import RecordPaymentModal from '../components/invoices/RecordPaymentModal';
import { downloadInvoicePDF } from '../components/invoices/InvoicePdfExport';
import Card from '../components/ui/Card';
import StatCard from '../components/cards/StatCard';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const STATUS_TABS = ['All', 'Draft', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled'];

const STATUS_STYLES = {
    Draft: 'bg-surface-variant text-on-surface-variant',
    Sent: 'bg-primary/15 text-primary',
    Paid: 'bg-tertiary/15 text-tertiary',
    'Partially Paid': 'bg-secondary/15 text-secondary',
    Overdue: 'bg-error/15 text-error',
    Cancelled: 'bg-surface-variant text-on-surface-variant opacity-60'
};

const Invoices = () => {
    const { invoices, revenueSummary, addInvoice, updateInvoice, deleteInvoice, duplicateInvoice, changeStatus } = useInvoices();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');
    const [projectFilter, setProjectFilter] = useState('All');
    const [freelancerFilter, setFreelancerFilter] = useState('All');
    const [showForm, setShowForm] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState(null);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [viewingInvoice, setViewingInvoice] = useState(null);
    const [openMenu, setOpenMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, direction: 'bottom' });

    // Close menu when clicking outside or scrolling window
    useEffect(() => {
        const handleClose = (e) => {
            // Do not close if clicking inside the menu dropdown or a button!
            if (e.target.closest('.action-menu-dropdown')) return;
            if (e.target.closest('button')) return;
            setOpenMenu(null);
        };
        document.addEventListener('mousedown', handleClose);
        return () => {
            document.removeEventListener('mousedown', handleClose);
        };
    }, []);
    const [markPaidModal, setMarkPaidModal] = useState(null);
    const [partialAmount, setPartialAmount] = useState('');
    const isFreelancer = user?.role === 'freelancer';

    const freelancerSummary = useMemo(() => {
        const total = invoices.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);
        const paid = invoices.reduce((sum, invoice) => sum + (Number(invoice.paidAmount) || 0), 0);
        return { total, paid, outstanding: Math.max(0, total - paid) };
    }, [invoices]);

    const filtered = useMemo(() => {
        let list = invoices;
        if (activeTab !== 'All') list = list.filter(i => i.status === activeTab);
        if (!isFreelancer && projectFilter !== 'All') list = list.filter(i => (i.project?._id || i.project) === projectFilter);
        if (!isFreelancer && freelancerFilter !== 'All') list = list.filter(i => (i.freelancer?._id || i.freelancer) === freelancerFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(i =>
                i.invoiceNumber?.toLowerCase().includes(q) ||
                i.client?.fullName?.toLowerCase().includes(q) ||
                i.project?.name?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [invoices, activeTab, search, projectFilter, freelancerFilter, isFreelancer]);

    const clientProjects = useMemo(() => Array.from(new Map(invoices
        .filter(invoice => invoice.project?._id || invoice.project)
        .map(invoice => [invoice.project?._id || invoice.project, invoice.project?.name || 'Project']))).map(([id, name]) => ({ id, name })), [invoices]);
    const clientFreelancers = useMemo(() => Array.from(new Map(invoices
        .filter(invoice => invoice.freelancer?._id || invoice.freelancer)
        .map(invoice => [invoice.freelancer?._id || invoice.freelancer, invoice.freelancer?.fullName || 'Freelancer']))).map(([id, name]) => ({ id, name })), [invoices]);

    const handleSave = async (data) => {
        if (editingInvoice) {
            await updateInvoice(editingInvoice._id, data);
        } else {
            await addInvoice(data);
        }
        setEditingInvoice(null);
        setShowForm(false);
    };

    const handleMenuOpen = (e, id) => {
        try {
            e.preventDefault();
            e.stopPropagation();
        } catch (err) { }

        if (openMenu === id) {
            setOpenMenu(null);
            return;
        }

        // ALWAYS trigger the menu immediately before positioning math to ensure it renders even if maths throw!
        setOpenMenu(id);

        try {
            const rect = e.currentTarget.getBoundingClientRect();

            // Vertical calculation
            const spaceBelow = window.innerHeight - (rect.bottom || 0);
            const direction = spaceBelow < 350 ? 'top' : 'bottom';
            const topPosition = direction === 'bottom' ? (rect.bottom || 0) + 8 : (rect.top || 0) - 8;

            // Horizontal calculation
            const menuWidth = 208; // w-52 is 13rem = 208px
            let horizontalLeftOffset = (rect.right || 0) - menuWidth;

            const minSafeLeft = 264; // Safely clears the lg:ml-64 sidebar

            // Apply clamps
            if (horizontalLeftOffset < minSafeLeft) horizontalLeftOffset = minSafeLeft;
            if (horizontalLeftOffset + menuWidth > window.innerWidth - 16) horizontalLeftOffset = window.innerWidth - menuWidth - 16;

            setMenuPosition({
                top: topPosition,
                left: horizontalLeftOffset,
                direction: direction
            });
        } catch (err) {
            console.error("Action menu position calculation failed, using fallback:", err);
            // Safe fallback center-ish styling to guarantee visibility
            setMenuPosition({
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                direction: 'bottom'
            });
        }
    };

    const handleAction = async (action, inv) => {
        setOpenMenu(null);
        try {
            switch (action) {
                case 'view':
                    setViewingInvoice(inv);
                    break;
                case 'edit':
                    setEditingInvoice(inv); setShowForm(true);
                    break;
                case 'duplicate':
                    await duplicateInvoice(inv._id);
                    break;
                case 'send':
                    await changeStatus(inv._id, 'Sent');
                    break;
                case 'paid':
                    await changeStatus(inv._id, 'Paid');
                    break;
                case 'record_payment':
                    setPaymentInvoice(inv);
                    break;
                case 'partial':
                    setMarkPaidModal(inv); setPartialAmount('');
                    break;
                case 'overdue':
                    await changeStatus(inv._id, 'Overdue');
                    break;
                case 'cancel':
                    if (window.confirm('Cancel this invoice?')) await changeStatus(inv._id, 'Cancelled');
                    break;
                case 'delete':
                    if (window.confirm('Delete this draft invoice?')) await deleteInvoice(inv._id);
                    break;
                case 'pdf':
                    downloadInvoicePDF(inv);
                    break;
            }
        } catch (err) {
            alert(err?.response?.data?.message || err.message || 'Action failed.');
        }
    };

    const handlePartialPaid = async () => {
        if (!partialAmount || isNaN(partialAmount)) return;
        await changeStatus(markPaidModal._id, 'Partially Paid', parseFloat(partialAmount));
        setMarkPaidModal(null);
    };

    return (
        <div className="p-0 sm:p-6 space-y-6 min-w-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline-md text-headline-md text-on-surface">Invoices</h1>
                    <p className="text-on-surface-variant text-body-md mt-0.5">{invoices.length} invoices · {user?.role === 'freelancer' ? 'View client payment documents' : 'Manage billing & payments'}</p>
                </div>
                {!isFreelancer && (
                    <button
                        onClick={() => { setEditingInvoice(null); setShowForm(true); }}
                        className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-body-sm flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" /> Create Invoice
                    </button>
                )}
            </div>

            {/* Revenue Summary Cards */}
            {isFreelancer ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Total Invoices', value: String(invoices.length), icon: 'ReceiptIndianRupee', color: 'text-primary', bg: 'bg-primary-container/20' },
                        { title: 'Total Invoice Amount', value: INR(freelancerSummary.total), icon: 'TrendingUp', color: 'text-on-surface', bg: 'bg-surface-variant/20' },
                        { title: 'Total Paid', value: INR(freelancerSummary.paid), icon: 'CheckCircle', color: 'text-tertiary', bg: 'bg-tertiary-container/20' },
                        { title: 'Total Outstanding', value: INR(freelancerSummary.outstanding), icon: 'AlertCircle', color: 'text-error', bg: 'bg-error-container/20' }
                    ].map(s => (
                        <StatCard key={s.title} title={s.title} value={s.value} subtitle="" iconName={s.icon} colorClass={s.color} bgColorClass={s.bg} change="" />
                    ))}
                </div>
            ) : revenueSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Total Revenue', value: INR(revenueSummary.totalRevenue), icon: 'TrendingUp', color: 'text-tertiary', bg: 'bg-tertiary-container/20' },
                        { title: 'Pending', value: INR(revenueSummary.pendingPayments), icon: 'Clock', color: 'text-primary', bg: 'bg-primary-container/20' },
                        { title: 'Overdue', value: INR(revenueSummary.overdueAmount), icon: 'AlertCircle', color: 'text-error', bg: 'bg-error-container/20' },
                        { title: 'Paid This Month', value: INR(revenueSummary.paidThisMonth), icon: 'CheckCircle', color: 'text-secondary', bg: 'bg-secondary-container/20' }
                    ].map(s => (
                        <StatCard key={s.title} title={s.title} value={s.value} subtitle="" iconName={s.icon} colorClass={s.color} bgColorClass={s.bg} change="" />
                    ))}
                </div>
            )}

            {/* Filter & Search */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative w-full min-w-0 sm:flex-1">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by invoice #, client, project..."
                            className="w-full pl-9 pr-4 py-2 bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>
                    {!isFreelancer && <>
                        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="w-full sm:w-auto bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer">
                            <option value="All">All Projects</option>
                            {clientProjects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
                        </select>
                        <select value={freelancerFilter} onChange={e => setFreelancerFilter(e.target.value)} className="w-full sm:w-auto bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer">
                            <option value="All">All Freelancers</option>
                            {clientFreelancers.map(freelancer => <option key={freelancer.id} value={freelancer.id}>{freelancer.name}</option>)}
                        </select>
                    </>}
                </div>
                {!isFreelancer && <div className="flex gap-1 mt-3 flex-wrap">
                    {STATUS_TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-body-sm font-bold transition-colors ${activeTab === tab ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant/50'}`}
                        >
                            {tab}
                            <span className="ml-1.5 text-[10px] opacity-70">
                                {tab === 'All' ? invoices.length : invoices.filter(i => i.status === tab).length}
                            </span>
                        </button>
                    ))}
                </div>}
            </Card>

            {/* Invoice Table */}
            <Card className="overflow-visible">
                {filtered.length === 0 ? (
                    <div className="text-center py-16 text-on-surface-variant">
                        <ReceiptIndianRupee className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No invoices found</p>
                        <p className="text-body-sm mt-1">{user?.role === 'freelancer' ? 'Client-created payment documents will appear here.' : 'Create your first invoice to get started.'}</p>
                    </div>
                ) : (
                    <>
                        <div className="hidden md:block overflow-visible">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-outline-variant/10 bg-surface-container-low/40">
                                        {['Invoice #', 'Client / Project', 'Due Date', 'Total', 'Paid', 'Outstanding', 'Status', ''].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest text-on-surface-variant">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(inv => (
                                        <tr key={inv._id} className="border-b border-outline-variant/10 hover:bg-surface-variant/10 transition-colors group">
                                            <td className="px-4 py-3 font-bold text-body-sm text-on-surface">{inv.invoiceNumber}</td>
                                            <td className="px-4 py-3 text-body-sm text-on-surface">
                                                {inv.client?.fullName || '—'}<br />
                                                <span className="text-[10px] text-on-surface-variant">{inv.project?.name || ''}</span>
                                            </td>
                                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">
                                                <span className="block">Due: {new Date(inv.dueDate).toLocaleDateString('en-IN')}</span>
                                                <span className="block text-[10px]">Created: {new Date(inv.createdAt || inv.issueDate).toLocaleDateString('en-IN')}</span>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-body-sm text-on-surface">{INR(inv.total)}</td>
                                            <td className="px-4 py-3 font-bold text-body-sm text-tertiary">
                                                {INR(inv.paidAmount || 0)}
                                                {inv.paidAt && <span className="block text-[10px] font-normal text-on-surface-variant">{new Date(inv.paidAt).toLocaleDateString('en-IN')}</span>}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-body-sm text-error">{INR(inv.total - (inv.paidAmount || 0))}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${STATUS_STYLES[inv.status] || ''}`}>{inv.status}</span>
                                            </td>
                                            <td className="px-4 py-3 relative">
                                                <button
                                                    onClick={e => handleMenuOpen(e, inv._id)}
                                                    className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {openMenu === inv._id && createPortal(
                                                    <div
                                                        style={{
                                                            position: 'fixed',
                                                            zIndex: 9999,
                                                            top: menuPosition.direction === 'bottom' ? `${menuPosition.top}px` : 'auto',
                                                            bottom: menuPosition.direction === 'top' ? `${window.innerHeight - menuPosition.top}px` : 'auto',
                                                            left: `${menuPosition.left}px`
                                                        }}
                                                        className={`action-menu-dropdown w-52 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl py-1 animate-in fade-in ${menuPosition.direction === 'top' ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {[
                                                            { action: 'view', label: 'View Details', icon: ReceiptIndianRupee, always: true },
                                                            { action: 'pdf', label: 'Download PDF', icon: Download, always: true },
                                                            { action: 'edit', label: 'Edit', icon: Edit2, show: user?.role !== 'freelancer' && inv.status === 'Draft' },
                                                            { action: 'send', label: 'Mark as Sent', icon: Send, show: user?.role !== 'freelancer' && ['Draft'].includes(inv.status) },
                                                            { action: 'record_payment', label: 'Record Payment', icon: IndianRupee, show: user?.role !== 'freelancer' && !['Draft', 'Paid', 'Cancelled'].includes(inv.status) },
                                                            { action: 'paid', label: 'Mark as Paid', icon: CheckCircle, show: user?.role !== 'freelancer' && ['Sent', 'Partially Paid', 'Overdue'].includes(inv.status) },
                                                            { action: 'partial', label: 'Partially Paid', icon: Clock, show: user?.role !== 'freelancer' && ['Sent', 'Overdue'].includes(inv.status) },
                                                            { action: 'overdue', label: 'Mark as Overdue', icon: AlertTriangle, show: user?.role !== 'freelancer' && ['Sent', 'Partially Paid'].includes(inv.status) },
                                                            { action: 'cancel', label: 'Cancel Invoice', icon: XCircle, show: user?.role !== 'freelancer' && !['Paid', 'Cancelled'].includes(inv.status) },
                                                            { action: 'delete', label: 'Delete Draft', icon: Trash2, show: user?.role !== 'freelancer' && inv.status === 'Draft', danger: true }
                                                        ].filter(a => a.always || a.show).map(({ action, label, icon: Icon, danger }) => (
                                                            <button key={action} onClick={() => handleAction(action, inv)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-body-sm font-bold transition-colors ${danger ? 'text-error hover:bg-error/10' : 'text-on-surface hover:bg-surface-variant/50'}`}>
                                                                <Icon className="w-4 h-4" />{label}
                                                            </button>
                                                        ))}
                                                    </div>,
                                                    document.body
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden flex flex-col gap-4 p-4 bg-surface-container-low/30">
                            {filtered.map(inv => (
                                <div key={inv._id} onClick={() => setViewingInvoice(inv)} className="bg-surface border border-outline-variant/20 rounded-2xl p-4 shadow-sm relative cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide inline-block mb-2 ${STATUS_STYLES[inv.status] || ''}`}>{inv.status}</span>
                                            <h4 className="font-bold text-body-md text-on-surface">{inv.invoiceNumber}</h4>
                                        </div>
                                        <div className="relative">
                                            <button
                                                onClick={e => { e.stopPropagation(); setViewingInvoice(inv); }}
                                                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors bg-surface-variant/30"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {/* We can re-use the exact same action menu via the portal, ensuring perfect mobile positioning over everything */}
                                        </div>
                                    </div>
                                    <div className="text-body-sm text-on-surface mb-3">
                                        <p className="font-bold text-on-surface-variant">{inv.client?.fullName || 'No Client'}</p>
                                        {inv.project && <p className="text-[11px] text-on-surface-variant/80">{inv.project.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-surface-variant/20 rounded-xl mb-3 border border-outline-variant/10">
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total</p>
                                            <p className="font-bold text-on-surface">{INR(inv.total)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1 text-tertiary">Paid</p>
                                            <p className="font-bold text-tertiary">{INR(inv.paidAmount || 0)}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-body-sm">
                                        <p className="text-[11px] text-on-surface-variant"><span className="font-bold">Due:</span> {new Date(inv.dueDate).toLocaleDateString('en-IN')}<br /><span className="font-bold">Created:</span> {new Date(inv.createdAt || inv.issueDate).toLocaleDateString('en-IN')}{inv.paidAt && <><br /><span className="font-bold">Paid:</span> {new Date(inv.paidAt).toLocaleDateString('en-IN')}</>}</p>
                                        {inv.total - (inv.paidAmount || 0) > 0 && <p className="text-[11px] font-bold text-error">Bal: {INR(inv.total - (inv.paidAmount || 0))}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Partially Paid Modal */}
            {markPaidModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center">
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setMarkPaidModal(null)} />
                    <div className="relative bg-surface-container rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-outline-variant/20">
                        <h3 className="font-bold text-on-surface mb-4">Enter Paid Amount</h3>
                        <p className="text-body-sm text-on-surface-variant mb-3">Total: {INR(markPaidModal.total)}</p>
                        <input
                            type="number" min="0" max={markPaidModal.total}
                            value={partialAmount} onChange={e => setPartialAmount(e.target.value)}
                            placeholder="Amount paid (₹)"
                            className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-2 text-on-surface focus:ring-1 focus:ring-primary focus:outline-none mb-4"
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setMarkPaidModal(null)} className="px-4 py-2 border border-outline-variant/30 rounded-xl text-on-surface-variant font-bold text-body-sm hover:bg-surface-variant/50">Cancel</button>
                            <button onClick={handlePartialPaid} className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-body-sm">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (editingInvoice ? (
                <InvoiceFormModal
                    invoice={editingInvoice}
                    clientManaged
                    onSave={handleSave}
                    onClose={() => { setShowForm(false); setEditingInvoice(null); }}
                />
            ) : (
                <CreateInvoiceForm
                    onClose={() => setShowForm(false)}
                    onCreated={() => setShowForm(false)}
                />
            ))}

            {/* Payment Modal */}
            {paymentInvoice && (
                <RecordPaymentModal
                    invoice={paymentInvoice}
                    onClose={() => setPaymentInvoice(null)}
                />
            )}
            <InvoiceDetailsModal invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} onDownload={downloadInvoicePDF} />
        </div>
    );
};

export default Invoices;
