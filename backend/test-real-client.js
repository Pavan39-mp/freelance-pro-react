import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from './models/User.js';
import axios from 'axios';

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const free = await User.findById('6a6325c1f14335ff6e8ed570');
    console.log('Freelancer Email:', free.email);
    
    // reset password manually to test it
    free.password = '$2a$10$XUa55M5i6oRk/u/V5L06b.Dtw5A36/aRY.CIt6oZ3rUa7WqE4pEHW'; // password123
    await free.save();
    
    try {
        const freeRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: free.email,
            password: 'password123'
        });
        const freeToken = freeRes.data.data.token;
        const freeClients = await axios.get('http://localhost:5001/api/clients?paginate=false', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Clients Count (No Pagination): ${freeClients.data.data.length}`);
    } catch(e) {
        console.error(e.response ? e.response.data : e.message);
    }
    process.exit(0);
};
run();
