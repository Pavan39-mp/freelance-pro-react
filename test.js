import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProjectRequest from './backend/models/ProjectRequest.js';

dotenv.config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance-pro');

async function createPending() {
    const pr = await ProjectRequest.create({
        client: '6a6326aaf14335ff6e8ed585',
        freelancer: '6a6325c1f14335ff6e8ed570',
        title: 'Diagnostic Shared Project',
        description: 'Auto-generation validation request.',
        budget: 9000,
        deadline: new Date('2026-11-01'),
        status: 'pending'
    });
    console.log("CREATED:", pr._id);
    process.exit();
}

createPending();
