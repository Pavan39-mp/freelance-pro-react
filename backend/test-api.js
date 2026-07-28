import assert from 'assert';

const BASE_URL = 'http://localhost:5001/api';
let token = '';
let clientName = `Test Client ${Date.now()}`;
let clientEmail = `testclient_${Date.now()}@example.com`;
let clientId = '';
let projectId = '';
let taskId = '';
let meetingId = '';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTests = async () => {
    console.log('=== STARTING FREELANCEPRO API INTEGRATION TESTS ===\n');

    try {
        // 1. Register User
        console.log('1. Testing User Registration...');
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: 'Test Auditor',
                email: `auditor_${Date.now()}@test.com`,
                password: 'Password123!'
            })
        });
        const registerData = await registerRes.json();
        assert.strictEqual(registerRes.status, 201);
        assert.ok(registerData.success);
        assert.ok(registerData.data.token);
        assert.strictEqual(registerData.data.fullName, 'Test Auditor');
        token = registerData.data.token;
        console.log('   ✓ User registered successfully.\n');

        const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 2. Fetch Profile
        console.log('2. Testing Get Profile (me)...');
        const profileRes = await fetch(`${BASE_URL}/auth/me`, {
            headers: authHeaders
        });
        const profileData = await profileRes.json();
        assert.strictEqual(profileRes.status, 200);
        assert.ok(profileData.success);
        assert.strictEqual(profileData.data.fullName, 'Test Auditor');
        console.log('   ✓ Profile retrieved successfully.\n');

        // 3. Create Client
        console.log('3. Testing Create Client...');
        const clientRes = await fetch(`${BASE_URL}/clients`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                fullName: clientName,
                email: clientEmail
            })
        });
        const clientData = await clientRes.json();
        console.log('clientRes status:', clientRes.status, 'clientData:', clientData);
        assert.strictEqual(clientRes.status, 201);
        assert.ok(clientData.success);
        assert.strictEqual(clientData.data.fullName, clientName);
        clientId = clientData.data._id;
        console.log('   ✓ Client created successfully.\n');

        // 4. Create Project
        console.log('4. Testing Create Project...');
        const projectRes = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                name: 'API Automation Project',
                client: clientId,
                budget: 5000,
                startDate: '2026-07-20',
                dueDate: '2026-08-20',
                priority: 'Normal',
                status: 'To Do'
            })
        });
        const projectData = await projectRes.json();
        assert.strictEqual(projectRes.status, 201);
        assert.ok(projectData.success);
        assert.strictEqual(projectData.data.name, 'API Automation Project');
        projectId = projectData.data._id;
        console.log('   ✓ Project created successfully.\n');

        // 5. Create Task
        console.log('5. Testing Create Task...');
        const taskRes = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Write API endpoint tests',
                projectId: projectId,
                estimatedHours: 8,
                priority: 'High',
                status: 'To Do'
            })
        });
        const taskData = await taskRes.json();
        assert.strictEqual(taskRes.status, 201);
        assert.ok(taskData.success);
        taskId = taskData.data._id;
        console.log('   ✓ Task created successfully.\n');

        // 6. Update Task Progress & Cascades
        console.log('6. Testing Update Task Progress (50% progress, 4h worked)...');
        const progressRes = await fetch(`${BASE_URL}/tasks/${taskId}/progress`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                newProgress: 50,
                hoursWorked: 4,
                summary: 'Drafted test outline and initial assertions',
                isBlocked: false
            })
        });
        const progressData = await progressRes.json();
        assert.strictEqual(progressRes.status, 200);
        assert.ok(progressData.success);
        assert.strictEqual(progressData.data.progress, 50);
        assert.strictEqual(progressData.data.workedHours, 4);

        // Verify cascade to Project
        const checkProjectRes = await fetch(`${BASE_URL}/projects`, {
            headers: authHeaders
        });
        const checkProjectData = await checkProjectRes.json();
        const targetProject = checkProjectData.data.find(p => p._id === projectId);
        // Since task is progress 50%, and it's the only task, project progress should also reflect 50%
        assert.strictEqual(targetProject.progress, 50);
        console.log('   ✓ Task progress updated and project progress cascaded to 50%.\n');

        // 7. Schedule Meeting
        console.log('7. Testing Meeting Scheduler...');
        const meetRes = await fetch(`${BASE_URL}/meetings`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Project Kickoff Sync',
                client: clientName,
                clientEmail: clientEmail,
                project: 'API Automation Project',
                provider: 'Google Meet',
                date: '2026-07-21',
                time: '14:00',
                duration: 30,
                agenda: 'Establish API testing criteria'
            })
        });
        const meetData = await meetRes.json();
        assert.strictEqual(meetRes.status, 201);
        assert.ok(meetData.success);
        assert.ok(meetData.data.joinUrl.includes('meet.google.com'));
        meetingId = meetData.data._id;
        console.log('   ✓ Meeting scheduled and invitations simulated successfully.\n');

        // 8. Verify Notifications Feed
        console.log('8. Checking Notifications Feed...');
        const notifRes = await fetch(`${BASE_URL}/notifications`, {
            headers: authHeaders
        });
        const notifData = await notifRes.json();
        assert.strictEqual(notifRes.status, 200);
        // We expect notifications for task creation and meeting scheduling
        assert.ok(notifData.data.length >= 2);
        console.log(`   ✓ Notifications generated successfully (Total: ${notifData.data.length}).\n`);

        // 9. Fetch Analytics
        console.log('9. Checking Analytics Calculations...');
        const analyticsRes = await fetch(`${BASE_URL}/analytics`, {
            headers: authHeaders
        });
        const analyticsData = await analyticsRes.json();
        assert.strictEqual(analyticsRes.status, 200);
        assert.ok(analyticsData.data.aggregates);
        assert.strictEqual(analyticsData.data.aggregates.activeClients, 1);
        assert.strictEqual(analyticsData.data.aggregates.completionRate, 0); // 50% is not completed yet (100% is completed)
        console.log('   ✓ Analytics calculations loaded successfully.\n');

        console.log('===================================================');
        console.log('🛡️  ALL API INTEGRATION TESTS PASSED SUCCESSFULLY! 🛡️');
        console.log('===================================================');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST SUITE FAILURE:', error);
        process.exit(1);
    }
};

runTests();
