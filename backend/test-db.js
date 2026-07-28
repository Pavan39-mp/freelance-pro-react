import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Project from './models/Project.js';
import User from './models/User.js';

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const projects = await Project.find({ platformClient: { $exists: true, $ne: null }});
    console.log('Projects with platformClient:', projects.length);
    if(projects.length > 0) {
        console.log('Sample createdBy:', projects[0].createdBy);
        console.log('Sample platformClient:', projects[0].platformClient);
    }
    const free = await User.findOne({ role: 'freelancer' });
    if (free) {
       console.log('Freelancer ID:', free._id);
       const p = await Project.find({ createdBy: free._id, platformClient: { $exists: true, $ne: null }});
       console.log('Projects for free1 with platformClient:', p.length);
    }
    process.exit(0);
};
run();
