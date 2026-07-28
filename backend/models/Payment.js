import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    amount: { type: Number, required: true, min: [0.01, 'Payment amount must be greater than 0'] },
    paymentDate: { type: Date, default: Date.now },
    method: {
        type: String,
        required: true,
        enum: ['Bank Transfer', 'UPI', 'Cash', 'Card', 'Other'],
        default: 'Bank Transfer'
    },
    reference: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;
