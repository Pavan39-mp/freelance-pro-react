import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ProjectRequest from './models/ProjectRequest.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance-pro');

async function check() {
    const pendings = await ProjectRequest.find({ status: 'pending' });
    console.log("PENDING REQUESTS:", pendings.length);
    if(pendings.length > 0) {
        console.log(pendings[0]._id);
    }
    process.exit();
}

check();
