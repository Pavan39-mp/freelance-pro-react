import React from 'react';
import { X, Download } from 'lucide-react';

const INR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);

const InvoiceDetailsModal = ({ invoice, onClose, onDownload }) => {
    if (!invoice) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-surface-container rounded-2xl border border-outline-variant/20 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low/60">
                    <div>
                        <h2 className="font-headline-sm text-on-surface">Invoice {invoice.invoiceNumber}</h2>
                        <p className="text-body-sm text-on-surface-variant mt-0.5">{invoice.project?.name || 'Project'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full text-on-surface-variant"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Client</p><p className="text-on-surface break-words">{invoice.client?.fullName || '—'}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Freelancer</p><p className="text-on-surface break-words">{invoice.freelancer?.fullName || '—'}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Invoice Date</p><p className="text-on-surface">{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p></div>
                        <div><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Due Date</p><p className="text-on-surface">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p></div>
                    </div>

                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Line Items</p>
                        <div className="space-y-2">
                            {(invoice.items || []).map((item, index) => (
                                <div key={item._id || index} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/10 flex gap-4 justify-between">
                                    <div className="min-w-0"><p className="text-body-sm text-on-surface whitespace-pre-wrap break-words">{item.description}</p><p className="text-[10px] text-on-surface-variant mt-1">Qty {item.quantity || 1} · Rate {INR(item.rate)}</p></div>
                                    <p className="font-bold text-body-sm text-on-surface shrink-0">{INR(item.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {(invoice.notes || invoice.terms) && <div className="space-y-4">
                        {invoice.notes && <div><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Notes</p><p className="text-body-sm text-on-surface whitespace-pre-wrap break-words">{invoice.notes}</p></div>}
                        {invoice.terms && <div><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Terms</p><p className="text-body-sm text-on-surface whitespace-pre-wrap break-words">{invoice.terms}</p></div>}
                    </div>}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-outline-variant/10 text-body-sm">
                        <div><p className="text-[10px] text-on-surface-variant">Total</p><p className="font-bold text-on-surface">{INR(invoice.total)}</p></div>
                        <div><p className="text-[10px] text-on-surface-variant">Paid</p><p className="font-bold text-tertiary">{INR(invoice.paidAmount)}</p></div>
                        <div><p className="text-[10px] text-on-surface-variant">Outstanding</p><p className="font-bold text-error">{INR(invoice.total - (invoice.paidAmount || 0))}</p></div>
                        <div><p className="text-[10px] text-on-surface-variant">Status</p><p className="font-bold text-on-surface">{invoice.status}</p></div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/60 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant font-bold text-body-sm hover:bg-surface-variant/50">Close</button>
                    <button onClick={() => onDownload(invoice)} className="px-5 py-2 bg-primary text-on-primary rounded-xl font-bold text-body-sm flex items-center gap-2 hover:bg-primary/90"><Download className="w-4 h-4" /> Download PDF</button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailsModal;
