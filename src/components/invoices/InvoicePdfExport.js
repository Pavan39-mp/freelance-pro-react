// src/components/invoices/InvoicePdfExport.js
// Uses jsPDF + jsPDF-AutoTable for professional PDF generation
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);

export const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const primary = [100, 80, 255]; // dark purple
    const light = [245, 243, 255];
    const dark = [30, 27, 40];
    const gray = [120, 115, 145];

    const pw = doc.internal.pageSize.getWidth();

    // ── Header Band ──────────────────────────────────────────────────────────────
    doc.setFillColor(...primary);
    doc.rect(0, 0, pw, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('FreelancePro', pw - 14, 14, { align: 'right' });
    doc.text('Creative Labs', pw - 14, 20, { align: 'right' });

    // ── Meta block ───────────────────────────────────────────────────────────────
    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.invoiceNumber || 'INV-XXXX', 14, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString('en-IN')}`, 14, 55);
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}`, 14, 61);

    const statusColors = {
        Paid: [0, 150, 100],
        Overdue: [200, 50, 50],
        Sent: [50, 100, 200],
        Draft: [120, 115, 145],
        Cancelled: [150, 100, 50],
        'Partially Paid': [180, 120, 0]
    };
    const sc = statusColors[invoice.status] || gray;
    doc.setFillColor(...sc);
    doc.roundedRect(pw - 44, 43, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text((invoice.status || 'Draft').toUpperCase(), pw - 29, 48.5, { align: 'center' });

    // ── Bill To ───────────────────────────────────────────────────────────────────
    doc.setFillColor(...light);
    doc.roundedRect(14, 68, 85, 35, 3, 3, 'F');
    doc.setTextColor(...gray);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 18, 75);
    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    const clientName = invoice.client?.fullName || invoice.client?.name || 'Client';
    doc.text(clientName, 18, 82);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    if (invoice.client?.email) doc.text(invoice.client.email, 18, 88);
    if (invoice.project?.name) { doc.text(`Project: ${invoice.project.name}`, 18, 94); }

    // ── Items Table ───────────────────────────────────────────────────────────────
    const cols = ['#', 'Description', 'Hrs', 'Qty', 'Rate (₹)', 'Amount (₹)'];
    const rows = (invoice.items || []).map((item, i) => [
        i + 1,
        item.description || '',
        item.hours || 0,
        item.quantity || 1,
        formatINR(item.rate),
        formatINR(item.amount)
    ]);

    autoTable(doc, {
        startY: 110,
        head: [cols],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: primary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8.5, textColor: dark },
        alternateRowStyles: { fillColor: light },
        columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 60, overflow: 'linebreak' }, 5: { halign: 'right', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 }
    });

    // ── Totals ────────────────────────────────────────────────────────────────────
    const finalY = doc.lastAutoTable.finalY + 8;
    const totColX = pw - 70;
    const totValX = pw - 14;

    const addTotRow = (label, val, bold = false, color = dark) => {
        doc.setTextColor(...color);
        doc.setFontSize(9);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(label, totColX, finalY + (addTotRow._y || 0));
        doc.text(formatINR(val), totValX, finalY + (addTotRow._y || 0), { align: 'right' });
        addTotRow._y = (addTotRow._y || 0) + 7;
    };
    addTotRow._y = 0;

    addTotRow('Subtotal:', invoice.subtotal);
    if (invoice.taxRate) addTotRow(`Tax (${invoice.taxRate}%):`, invoice.taxAmount);
    if (invoice.discount) addTotRow('Discount:', -invoice.discount);

    doc.setDrawColor(...primary);
    doc.line(totColX, finalY + (addTotRow._y || 0) - 2, pw - 14, finalY + (addTotRow._y || 0) - 2);
    addTotRow('TOTAL DUE:', invoice.total, true, primary);
    if (invoice.paidAmount > 0 && invoice.status !== 'Paid') {
        addTotRow('Paid:', invoice.paidAmount, false, [0, 150, 100]);
        addTotRow('Balance:', invoice.total - invoice.paidAmount, true, [200, 50, 50]);
    }

    // ── Notes & Terms ─────────────────────────────────────────────────────────────
    const notesY = finalY + (addTotRow._y || 0) + 12;
    if (invoice.notes || invoice.terms) {
        doc.setFillColor(...light);
        doc.roundedRect(14, notesY, pw - 28, invoice.notes && invoice.terms ? 28 : 16, 3, 3, 'F');
        let ny = notesY + 7;
        if (invoice.notes) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(...gray);
            doc.text('Notes', 18, ny);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...dark);
            doc.text(invoice.notes, 18, ny + 5);
            ny += 12;
        }
        if (invoice.terms) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(...gray);
            doc.text('Terms & Conditions', 18, ny);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...dark);
            doc.text(invoice.terms, 18, ny + 5);
        }
    }

    // ── Footer ────────────────────────────────────────────────────────────────────
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(...primary);
    doc.rect(0, ph - 14, pw, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business! — FreelancePro Creative Labs', pw / 2, ph - 5.5, { align: 'center' });

    doc.save(`${invoice.invoiceNumber || 'invoice'}.pdf`);
};
