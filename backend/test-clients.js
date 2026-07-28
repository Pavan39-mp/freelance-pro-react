import axios from 'axios';
const testAuth = async () => {
    try {
        console.log('Testing Freelancer Login...');
        const freeRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'free2@example.com',
            password: 'password123'
        });
        const freeToken = freeRes.data.data.token;
        console.log('Freelancer Token Retrieved.');

        const freeClients = await axios.get('http://localhost:5001/api/clients?paginate=false', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Freelancer GET /api/clients -> ${freeClients.status} OK (Clients Count: ${freeClients.data.data.length})`);
        console.log(JSON.stringify(freeClients.data.data, null, 2));

    } catch (e) {
        console.error('ERROR during testing:', e.response ? e.response.data : e.message);
    }
};

testAuth();
