import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    role: { type: String, enum: ['freelancer', 'client'], default: 'freelancer' },
    avatar: { type: String, default: '' },
    location: { type: String, default: '' },
    skills: { type: String, default: '' },
    bio: { type: String, default: '' },
    title: { type: String, default: '' },
    isPublicProfile: { type: Boolean, default: false },
    services: { type: String, default: '' },
    experience: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    availability: { type: String, default: '' },
    joinedDate: { type: String, default: 'January 2024' },
    plan: { type: String, default: 'Pro Plan' },
    themePreference: { type: String, enum: ['light', 'dark'], default: 'dark' },
    notificationPreferences: {
        desktop: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        meetingReminders: { type: Boolean, default: true },
        taskDueAlerts: { type: Boolean, default: true },
        clientUpdates: { type: Boolean, default: false },
        projectUpdates: { type: Boolean, default: true },
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);
export default User;
