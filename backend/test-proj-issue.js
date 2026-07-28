import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Project from './models/Project.js';
import User from './models/User.js';

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const free = await User.findOne({role: 'freelancer'});
    if(free) {
       console.log('Freelancer ID:', free._id);
       const projects = await Project.find({ createdBy: free._id }).lean();
       console.log(JSON.stringify(projects, null, 2));
    }
    process.exit(0);
};
run();
