const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("LOGIN STATUS:", res.statusCode);
    console.log("LOGIN BODY:", body);
  });
});

req.write(JSON.stringify({
  email: 'testclient2@example.com',
  password: 'password123'
}));
req.end();
