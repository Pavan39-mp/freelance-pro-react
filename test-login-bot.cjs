const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    await page.goto('http://localhost:5173/register?role=client');
    await page.waitForSelector('input#fullName', { timeout: 3000 });
    
    // Register
    await page.type('input#fullName', 'Puppeteer Client');
    await page.type('input#email', 'pupclient' + Date.now() + '@example.com');
    await page.type('input#password', 'password123');
    await page.type('input#confirmPassword', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to login
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 });
    console.log('Redirected to:', page.url());
    
    // Fill login
    const email = await page.$eval('input#email', el => el.value);
    console.log("Email field value:", email);
    // Since we generated email, let's type it. The form probably doesn't retain it unless we did.
    // wait, we navigate to /login?role=client or /? Wait, Register.jsx redirects to /
  } catch (error) {
    console.error('Puppeteer Error:', error);
  } finally {
    await browser.close();
  }
})();
