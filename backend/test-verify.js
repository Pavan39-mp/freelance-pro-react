import axios from 'axios';

const testAuth = async () => {
    try {
        console.log('Testing Client Login...');
        const clientRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'client2@example.com',
            password: 'password123'
        });
        const clientToken = clientRes.data.data.token;
        console.log('Client Token Retrieved.');

        const clientProjects = await axios.get('http://localhost:5001/api/projects?paginate=false', {
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        console.log(`Client GET /api/projects -> ${clientProjects.status} OK (Projects Count: ${clientProjects.data.data.length})`);

        const clientNotifs = await axios.get('http://localhost:5001/api/notifications?paginate=false', {
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        console.log(`Client GET /api/notifications -> ${clientNotifs.status} OK (Notifs Count: ${clientNotifs.data.data.length})`);

        console.log('Testing Freelancer Login...');
        const freeRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'free2@example.com',
            password: 'password123'
        });
        const freeToken = freeRes.data.data.token;
        console.log('Freelancer Token Retrieved.');

        const freeProjects = await axios.get('http://localhost:5001/api/projects?paginate=false', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Freelancer GET /api/projects -> ${freeProjects.status} OK`);

        const freeNotifs = await axios.get('http://localhost:5001/api/notifications?paginate=false', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Freelancer GET /api/notifications -> ${freeNotifs.status} OK`);

    } catch (e) {
        console.error('ERROR during testing:', e.response ? e.response.data : e.message);
    }
};

testAuth();
