import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5001/api' });

const runFlow = async () => {
    try {
        console.log('1. Logging in as free1@example.com');
        const freeRes = await api.post('/auth/login', { email: 'freelancer@example.com', password: 'password123' }).catch(
            () => api.post('/auth/register', { fullName: 'Free 1', email: 'free1@example.com', password: 'password123', role: 'freelancer' })
        );
        const freeToken = freeRes.data.data.token;
        const freelancerId = freeRes.data.data.user._id;

        console.log('2. Logging in as client1@example.com');
        const clientRes = await api.post('/auth/login', { email: 'client@example.com', password: 'password123' }).catch(
            () => api.post('/auth/register', { fullName: 'Client 1', email: 'client1@example.com', password: 'password123', role: 'client' })
        );
        const clientToken = clientRes.data.data.token;

        // Ensure freelancer is public
        await api.put('/users/profile', { isPublicProfile: true }, { headers: { Authorization: `Bearer ${freeToken}` } });

        console.log('3. Client sending project request');
        const pr = await api.post('/project-requests', {
            freelancerId,
            title: 'Test Web App',
            description: 'Build me a web app',
            budget: 5000,
            deadline: '2026-12-31'
        }, { headers: { Authorization: `Bearer ${clientToken}` } }).catch(e => {
            if (e.response?.data?.message?.includes('already have a pending request')) {
                return api.get('/project-requests', { headers: { Authorization: `Bearer ${clientToken}` } }).then(res => ({
                    data: { data: res.data.data[0] }
                }));
            }
            throw e;
        });
        const prId = pr.data.data._id || pr.data.data.id;

        console.log('4. Freelancer accepting request', prId);
        if (pr.data.data.status === 'pending') {
            await api.patch(`/project-requests/${prId}/status`, { status: 'accepted' }, { headers: { Authorization: `Bearer ${freeToken}` } });
        }

        console.log('5. Checking Free Clients');
        const freeClients = await api.get('/clients?paginate=false', { headers: { Authorization: `Bearer ${freeToken}` } });
        console.log('Free Clients:', freeClients.data.data);

    } catch (e) {
        console.error('ERROR:', e.response?.data || e.message);
    }
};
runFlow();
