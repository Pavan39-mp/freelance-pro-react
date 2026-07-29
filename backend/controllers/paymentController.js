import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { syncInvoicePayments } from '../utils/syncInvoicePayments.js';

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
    try {
        const { invoice: invoiceId, amount, paymentDate, method, reference, notes } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ message: 'Payment amount must be greater than 0' });
        }

        // Validate Invoice exists and belongs to user
        const invoice = await Invoice.findOne({ _id: invoiceId, createdBy: req.user._id });
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (invoice.status === 'Cancelled') {
            return res.status(400).json({ message: 'Cannot apply payments to a cancelled invoice.' });
        }

        // Calculate Outstanding manually for validation (Step 2 logic. Will integrate fully in Step 3)
        const existingPayments = await Payment.find({ invoice: invoiceId });
        const totalPaidSoFar = existingPayments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = invoice.total - totalPaidSoFar;

        if (amount > outstanding) {
            return res.status(400).json({ message: `Payment amount (${amount}) exceeds outstanding balance (${outstanding}).` });
        }

        const payment = new Payment({
            invoice: invoiceId,
            client: invoice.client,
            project: invoice.project || null,
            amount: Number(amount),
            paymentDate: paymentDate || Date.now(),
            method: method || 'Bank Transfer',
            reference,
            notes,
            createdBy: req.user._id
        });

        const createdPayment = await payment.save();
        
        // Sync invoice status and paidAmount
        await syncInvoicePayments(invoiceId);

        await createdPayment.populate('client', 'fullName email company');
        await createdPayment.populate('invoice', 'invoiceNumber total');

        res.status(201).json(createdPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
    try {
        const query = req.user.role === 'freelancer'
            ? { invoice: { $in: (await Invoice.find({ freelancer: req.user._id }).select('_id')).map(invoice => invoice._id) } }
            : { createdBy: req.user._id };
        const payments = await Payment.find(query)
            .populate('client', 'fullName email company')
            .populate('invoice', 'invoiceNumber status total')
            .populate('project', 'name')
            .sort({ paymentDate: -1 });
        res.json(payments);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get payments by invoice ID
// @route   GET /api/payments/invoice/:invoiceId
// @access  Private
export const getInvoicePayments = async (req, res) => {
    try {
        const invoice = await Invoice.findOne(req.user.role === 'freelancer'
            ? { _id: req.params.invoiceId, freelancer: req.user._id }
            : { _id: req.params.invoiceId, createdBy: req.user._id });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        const payments = await Payment.find({ invoice: invoice._id })
            .populate('client', 'fullName')
            .sort({ paymentDate: -1 });
        res.json(payments);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        // Wait, mongoose `remove()` was deprecated in Mongoose 7/8. We use deleteOne()
        // but if we are manually tracking hooks, we might need a specific approach. 
        // For Step 2, I'll just deleteOne it.
        const invoiceId = payment.invoice;
        await payment.deleteOne();
        
        // Sync invoice after deletion
        await syncInvoicePayments(invoiceId);

        res.json({ message: 'Payment removed' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
