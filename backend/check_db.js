import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:57417/freelancepro', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        const User = mongoose.model('User', new mongoose.Schema({
            fullName: String,
            role: String,
            isPublicProfile: Boolean
        }, { strict: false }));
        
        const totalUsers = await User.countDocuments();
        const freelancers = await User.find({ role: 'freelancer' });
        const allRoles = await User.distinct('role');
        const freelancersWithPublic = await User.find({ role: 'freelancer', isPublicProfile: true });
        
        console.log({
            totalUsers,
            freelancerCount: freelancers.length,
            roles: allRoles,
            freelancersWithPublic: freelancersWithPublic.length,
            sampleFreelancer: freelancers[0] ? { role: freelancers[0].role, isPublicProfile: freelancers[0].isPublicProfile } : null
        });
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkDb();
