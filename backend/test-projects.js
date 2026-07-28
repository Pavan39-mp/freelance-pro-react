import axios from 'axios';
const testAuth = async () => {
    try {
        const freeRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'free2@example.com',
            password: 'password123'
        });
        const freeToken = freeRes.data.data.token;
        const freeProjects = await axios.get('http://localhost:5001/api/projects?paginate=false', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Projects Count: ${freeProjects.data.data.length}`);
        console.log(JSON.stringify(freeProjects.data.data, null, 2));

        const freeRequests = await axios.get('http://localhost:5001/api/project-requests', {
            headers: { Authorization: `Bearer ${freeToken}` }
        });
        console.log(`Requests Count: ${freeRequests.data.data.length}`);

    } catch (e) {
        console.error('ERROR during testing:', e);
    }
};

testAuth();
