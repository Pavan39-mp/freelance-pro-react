import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const maskedUri = process.env.MONGODB_URI ? process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : 'undefined';
        console.log(`Connecting to MongoDB Atlas at ${maskedUri}...`);

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log('✅ MongoDB Connected Successfully securely');
        return true;
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed! Error: ${error.message}`);
        // Do not terminate the HTTP server. The caller retries the connection so
        // local API clients receive a useful response instead of ECONNREFUSED.
        return false;
    }
};

export default connectDB;
