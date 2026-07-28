import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';

export const syncInvoicePayments = async (invoiceId) => {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return;

    // 1. Calculate Total Paid
    const payments = await Payment.find({ invoice: invoiceId });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // 2. Status logic
    let newStatus = invoice.status;
    
    if (invoice.status === 'Cancelled' || invoice.status === 'Draft') {
        // Leave as is
    } else {
        if (totalPaid >= invoice.total && invoice.total > 0) {
            newStatus = 'Paid';
        } else if (totalPaid > 0) {
            newStatus = 'Partially Paid';
        } else {
            // No payments
            const isOverdue = new Date(invoice.dueDate) < new Date();
            newStatus = isOverdue ? 'Overdue' : 'Sent';
        }
    }
    
    // Save to Database
    invoice.paidAmount = totalPaid;
    invoice.status = newStatus;
    
    await invoice.save();
    return invoice;
};
