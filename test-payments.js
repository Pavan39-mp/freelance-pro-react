import axios from 'axios';

async function test() {
    try {
        // Sign in first
        const loginRes = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@freelancepro.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Get invoices
        const invoicesRes = await axios.get('http://localhost:5001/api/invoices', { headers });
        const invoices = invoicesRes.data;
        
        let invoice = invoices.find(i => i.status === 'Partially Paid' || i.status === 'Sent');
        if (!invoice) {
             console.log("No Sent or Partially Paid invoice found. Trying Draft... Wait we can't pay Drafts.");
             invoice = invoices[0];
        }
        console.log("Testing Invoice:", invoice.invoiceNumber, "Total:", invoice.total, "Paid:", invoice.paidAmount, "Status:", invoice.status);

        // Record a Payment
        const paymentRes = await axios.post('http://localhost:5001/api/payments', {
            invoice: invoice._id,
            amount: 1,
            paymentDate: new Date().toISOString(),
            method: 'Bank Transfer'
        }, { headers });
        
        console.log("Payment 1 Success:", paymentRes.data);

        // Fetch invoice again
        const invoiceRes1 = await axios.get(`http://localhost:5001/api/invoices/${invoice._id}`, { headers });
        console.log("Invoice after Payment 1:", invoiceRes1.data.paidAmount, invoiceRes1.data.status);
        
        // Record Payment 2
        const paymentRes2 = await axios.post('http://localhost:5001/api/payments', {
            invoice: invoice._id,
            amount: 2,
            paymentDate: new Date().toISOString(),
            method: 'Bank Transfer'
        }, { headers });
        
        console.log("Payment 2 Success:", paymentRes2.data);
        
        // Fetch invoice again
        const invoiceRes2 = await axios.get(`http://localhost:5001/api/invoices/${invoice._id}`, { headers });
        console.log("Invoice after Payment 2:", invoiceRes2.data.paidAmount, invoiceRes2.data.status);
        
    } catch(err) {
        console.error("Test Error:", err.response?.data || err.message);
    }
}
test();
