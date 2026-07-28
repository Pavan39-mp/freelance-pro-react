import React, { useState, useEffect } from 'react';
import { X, Calendar, IndianRupee, CheckCircle, FileText, Smartphone, CreditCard } from 'lucide-react';
import { createPayment, getInvoicePayments } from '../../services/paymentService';
import { useInvoices } from '../../context/InvoiceContext';
import toast from 'react-hot-toast';

const RecordPaymentModal = ({ invoice, onClose }) => {
    const { refresh } = useInvoices();
    const outstanding = invoice.total - (invoice.paidAmount || 0);

    const [form, setForm] = useState({
        amount: outstanding,
        paymentDate: new Date().toISOString().substring(0, 10),
        method: 'Bank Transfer',
        reference: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getInvoicePayments(invoice._id);
                setHistory(res);
            } catch (err) {
                console.error("Failed to fetch payment history", err);
            }
        };
        fetchHistory();
    }, [invoice._id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (form.amount <= 0) {
            toast.error('Payment amount must be greater than 0');
            return;
        }
        if (form.amount > outstanding) {
            toast.error(`Amount cannot exceed outstanding balance (₹${outstanding.toLocaleString('en-IN')})`);
            return;
        }

        setLoading(true);
        try {
            await createPayment({
                invoice: invoice._id,
                ...form,
                paymentDate: new Date(form.paymentDate).toISOString()
            });
            toast.success('Payment recorded successfully');
            await refresh(); // Syncs all dashboard/invoice data
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-high rounded-3xl w-full max-w-md shadow-2xl border border-outline-variant/20 overflow-hidden flex flex-col max-h-[90vh]">

                <div className="shrink-0 p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
                    <div>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface">Record Payment</h4>
                        <p className="text-body-sm text-on-surface-variant mt-1">For {invoice.invoiceNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 bg-surface-container-highest/30 border-b border-outline-variant/10 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Outstanding</p>
                        <p className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(outstanding)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Invoice Total</p>
                        <p className="text-body-md font-bold text-on-surface">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(invoice.total)}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                    <div>
                        <label className="block text-label-sm font-bold text-on-surface mb-2">Payment Amount (₹)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-on-surface-variant font-medium">₹</span>
                            </div>
                            <input
                                type="number"
                                required
                                min="1"
                                max={outstanding}
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? '' : Number(e.target.value.replace(/[^0-9.]/g, '')) })}
                                className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-body-lg rounded-xl focus:ring-2 focus:ring-primary focus:border-primary pl-10 pr-4 py-3 placeholder:text-on-surface-variant/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-label-sm font-bold text-on-surface mb-2">Date</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="w-4 h-4 text-on-surface-variant" />
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={form.paymentDate}
                                    onChange={(e) => setForm({ ...form, paymentDate: e.target.value })}
                                    className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl focus:ring-2 focus:ring-primary focus:border-primary pl-10 pr-3 py-3"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-label-sm font-bold text-on-surface mb-2">Method</label>
                            <select
                                value={form.method}
                                onChange={(e) => setForm({ ...form, method: e.target.value })}
                                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl focus:ring-2 focus:ring-primary focus:border-primary px-4 py-3"
                            >
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Cash">Cash</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-label-sm font-bold text-on-surface mb-2 pt-2">Transaction ID / Reference (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. UTR Number or Txn ID"
                            value={form.reference}
                            onChange={(e) => setForm({ ...form, reference: e.target.value })}
                            className="w-full bg-surface-container border border-outline-variant/30 text-on-surface rounded-xl focus:ring-2 focus:ring-primary focus:border-primary px-4 py-3"
                        />
                    </div>

                    {history.length > 0 && (
                        <div className="pt-4 border-t border-outline-variant/10">
                            <label className="block text-label-sm font-bold text-on-surface mb-3">Previous Payments</label>
                            <div className="space-y-2">
                                {history.map((p, idx) => (
                                    <div key={p._id} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                                        <div>
                                            <p className="text-[11px] font-bold text-on-surface">Payment {history.length - idx}</p>
                                            <p className="text-[9px] text-on-surface-variant font-medium mt-0.5">{new Date(p.paymentDate).toLocaleDateString()} • {p.method}</p>
                                        </div>
                                        <p className="text-body-sm font-bold text-primary">
                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.amount)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </form>

                <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low/50">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-label-caps text-[11px] font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label-caps text-[11px] font-bold hover:bg-primary/90 transition-colors shadow-md disabled:bg-primary/50 flex items-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Save Payment
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecordPaymentModal;
