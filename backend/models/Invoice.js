import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    hours: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
    amount: { type: Number, required: true }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    // Invoices are issued by an authenticated platform client to a freelancer.
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Partially Paid', 'Overdue', 'Cancelled'],
        default: 'Draft'
    },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    currency: { type: String, default: 'INR' },
    items: [invoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },       // percentage e.g. 18
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },       // fixed ₹ amount
    total: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    terms: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sentAt: { type: Date, default: null },
    paidAt: { type: Date, default: null }
}, { timestamps: true });

// A client can issue one payment document for one assigned freelancer/project.
// This also protects against concurrent duplicate create requests.
invoiceSchema.index({ client: 1, project: 1, freelancer: 1 }, { unique: true });

// Auto-generate sequential invoice number before save
invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const year = new Date().getFullYear();
        const prefix = `INV-${year}-`;
        const last = await mongoose.model('Invoice').findOne(
            { invoiceNumber: { $regex: `^${prefix}` } },
            { invoiceNumber: 1 },
            { sort: { invoiceNumber: -1 } }
        );
        let seq = 1;
        if (last) {
            const parts = last.invoiceNumber.split('-');
            seq = parseInt(parts[parts.length - 1], 10) + 1;
        }
        this.invoiceNumber = `${prefix}${String(seq).padStart(4, '0')}`;
    }
    next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
