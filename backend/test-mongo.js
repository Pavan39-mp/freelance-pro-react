import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log("URI:", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("SUCCESS");
        process.exit(0);
    })
    .catch(err => {
        console.error("ERROR:", err);
        process.exit(1);
    });
