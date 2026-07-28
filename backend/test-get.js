import axios from 'axios';
const testAuth = async () => {
    try {
        const freeRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'freelancer@example.com',
            password: 'password123'
        });
        const freeToken = freeRes.data.data.token;
        const freeClients = await axios.get('http://localhost:5001/api/clients?paginate=false', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Clients Count (No Pagination): ${freeClients.data.data.length}`);
        
        const freeClientsPaginated = await axios.get('http://localhost:5001/api/clients?page=1&limit=10', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Clients Count (Paginated): ${freeClientsPaginated.data.data.items.length}`);
    } catch (e) {
        console.error('ERROR during testing:', e);
    }
};
testAuth();
