import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    company: { type: String, default: '' },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Pending', 'Inactive', 'Lead'], default: 'Active' },
    industry: { type: String, default: '' },
    notes: { type: String, default: '' },
    avatar: { type: String, default: '' },
    website: { type: String, default: '' },
    country: { type: String, default: '' },
    priority: { type: String, default: 'Normal' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    archived: { type: Boolean, default: false }
}, { timestamps: true });

const Client = mongoose.model('Client', ClientSchema);
export default Client;
