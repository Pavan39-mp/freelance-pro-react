import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Project from './models/Project.js';
import User from './models/User.js';
import Client from './models/Client.js';
import ProjectRequest from './models/ProjectRequest.js';

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    try {
        const userId = '6a6325c1f14335ff6e8ed570'; // free1 ID

        // Option 1: Using ProjectRequest
        const acceptedRequests = await ProjectRequest.find({
            freelancer: userId,
            status: 'accepted'
        });
        const platformClientIdsRe = [...new Set(acceptedRequests.map(r => r.client.toString()))];
        console.log('platformClientIds from Requests:', platformClientIdsRe);
        const platformUsersRe = await User.find({ _id: { $in: platformClientIdsRe } });
        console.log('Platform Users from Requests:', platformUsersRe.length);

        // Option 2: Using Project (the current buggy logic)
        const projectsWithPlatformClients = await Project.find({
            createdBy: userId,
            platformClient: { $exists: true, $ne: null }
        }).select('platformClient');

        const platformClientIds = [...new Set(projectsWithPlatformClients.map(p => p.platformClient.toString()))];
        console.log('platformClientIds from Projects:', platformClientIds);
        
        const platformUsers = await User.find({ _id: { $in: platformClientIds } });
        console.log('Platform Users from Projects:', platformUsers.length);
        
        console.log('Sample User Data:', platformUsers[0]?.email);

        const clients = await Client.find({ createdBy: userId });
        const existingEmails = new Set(clients.map(c => c.email.toLowerCase()));
        
        const mappedPlatformClients = platformUsers
            .filter(u => !existingEmails.has(u.email.toLowerCase()))
            .map(u => ({ email: u.email }));
        console.log('Mapped Clients Length:', mappedPlatformClients.length);
        
    } catch(e) {
         console.error(e);
    }
    process.exit(0);
};
run();
