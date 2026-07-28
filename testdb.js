const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/freelance-pro');
const ProjectSchema = new mongoose.Schema({ name: String }, { strict: false });
const Project = mongoose.model('Project', ProjectSchema);

async function check() {
    console.log("Checking direct DB state...");
    const projects = await Project.find({});
    console.log("PROJECTS:", projects.length);
    if(projects.length > 0) {
        console.log(JSON.stringify(projects[projects.length - 1], null, 2));
    }
    process.exit();
}

check();
