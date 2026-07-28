import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelance-pro');

async function check() {
    const projects = await Project.find({});
    console.log("PROJECTS:", projects.length);
    console.log(JSON.stringify(projects, null, 2));
    process.exit();
}

check();
