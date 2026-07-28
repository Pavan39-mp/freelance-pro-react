const axios = require('axios');

async function run() {
    try {
        console.log("1. Registering client user...");
        const registerRes = await axios.post('http://localhost:5001/api/auth/register', {
            fullName: 'Test Client',
            email: 'testclient2@example.com',
            password: 'password123',
            role: 'client'
        });
        
        console.log("Registration response:", registerRes.data);

        console.log("\n2. Logging in client user...");
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'testclient2@example.com',
            password: 'password123'
        });
        
        console.log("Login response:", loginRes.data);
        const token = loginRes.data.data.token;

        console.log("\n3. Fetching /auth/me...");
        const meRes = await axios.get('http://localhost:5001/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Profile response:", meRes.data);
        
    } catch (error) {
        console.error("Error!", error.response ? error.response.data : error.message);
    }
}

run();
