import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';

const calcTotals = (items, taxRate, discount) => {
    const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
    const taxAmount = parseFloat(((subtotal * (taxRate || 0)) / 100).toFixed(2));
    const total = parseFloat((subtotal + taxAmount - (discount || 0)).toFixed(2));
    return { subtotal, taxAmount, total };
};

const parseDate = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

// GET /api/invoices
export const getInvoices = async (req, res) => {
    try {
        const { status, clientId, project, page = 1, limit = 50 } = req.query;
        let filter = {};

        if (req.user.role === 'freelancer') {
            filter = { freelancer: req.user._id };
        } else if (req.user.role === 'client') {
            filter.createdBy = req.user._id;
        }

        if (status && status !== 'All') filter.status = status;
        if (clientId) filter.client = clientId;
        if (project) filter.project = project;

        const invoices = await Invoice.find(filter)
            .populate('client', 'fullName email')
            .populate('freelancer', 'fullName email')
            .populate('project', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Invoice.countDocuments(filter);
        res.json({ invoices, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/invoices/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getRevenueSummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Optional date range for filtering revenue metrics. Analytics sends full
        // ISO timestamps, so parse each value once and never append a second time.
        const hasStartDate = req.query.startDate !== undefined && req.query.startDate !== '';
        const hasEndDate = req.query.endDate !== undefined && req.query.endDate !== '';
        const startDate = parseDate(req.query.startDate);
        const endDate = parseDate(req.query.endDate);
        if ((hasStartDate && !startDate) || (hasEndDate && !endDate)) {
            return res.status(400).json({ message: 'Invalid startDate or endDate' });
        }
        if (startDate && endDate && startDate > endDate) {
            return res.status(400).json({ message: 'startDate must be earlier than or equal to endDate' });
        }

        // Fetch all non-cancelled invoices
        const invFilter = req.user.role === 'freelancer'
            ? { freelancer: userId, status: { $ne: 'Cancelled' } }
            : { createdBy: userId, status: { $ne: 'Cancelled' } };
        const all = await Invoice.find(invFilter)
            .populate('client', 'fullName')
            .populate('project', 'name')
            .lean();

        // Fetch all payments (with date-range filter applied)
        const paymentFilter = req.user.role === 'freelancer'
            ? { invoice: { $in: all.map(invoice => invoice._id) } }
            : { createdBy: userId };
        if (startDate || endDate) {
            paymentFilter.paymentDate = {};
            if (startDate) paymentFilter.paymentDate.$gte = startDate;
            if (endDate) paymentFilter.paymentDate.$lte = endDate;
        }
        const allPayments = await Payment.find(paymentFilter).lean();

        let totalRevenue = 0, pendingPayments = 0, overdueAmount = 0, paidThisMonth = 0;
        const monthlyMap = {};
        const clientMap = {};
        const projectMap = {};
        const methodMap = {};
        const statusCount = { Draft: 0, Sent: 0, Paid: 0, 'Partially Paid': 0, Overdue: 0, Cancelled: 0 };

        // Count cancelled separately
        const cancelFilter = req.user.role === 'freelancer'
            ? { freelancer: userId, status: 'Cancelled' }
            : { createdBy: userId, status: 'Cancelled' };
        const cancelledCount = await Invoice.countDocuments(cancelFilter);
        statusCount.Cancelled = cancelledCount;

        // Process payments for revenue, method distribution, etc.
        allPayments.forEach(p => {
            totalRevenue += p.amount;
            const paymentDate = parseDate(p.paymentDate);
            if (paymentDate && paymentDate >= monthStart && paymentDate <= monthEnd) {
                paidThisMonth += p.amount;
            }
            // Method distribution
            const method = p.method || 'Other';
            methodMap[method] = (methodMap[method] || 0) + p.amount;
        });

        // Compute total paid/outstanding across all invoices (not filtered by date)
        let totalPaidAll = 0, totalOutstandingAll = 0;

        // Process invoices for structure, pending, overdue, project/client maps
        all.forEach(inv => {
            if (statusCount[inv.status] !== undefined) statusCount[inv.status]++;

            const paid = inv.paidAmount || 0;
            const outstanding = inv.total - paid;
            totalPaidAll += paid;
            totalOutstandingAll += Math.max(0, outstanding);

            if (inv.status !== 'Draft') {
                // Monthly billed chart uses invoice issue date (all time, not date-filtered)
                const month = new Date(inv.issueDate).toISOString().slice(0, 7);
                monthlyMap[month] = (monthlyMap[month] || 0) + inv.total;

                // Client revenue (paid amounts)
                const clientName = inv.client?.fullName || 'Unknown';
                clientMap[clientName] = (clientMap[clientName] || 0) + paid;

                // Project revenue (total billed per project)
                if (inv.project?.name) {
                    const projName = inv.project.name;
                    if (!projectMap[projName]) projectMap[projName] = { billed: 0, paid: 0 };
                    projectMap[projName].billed += inv.total;
                    projectMap[projName].paid += paid;
                }
            }

            if (inv.status === 'Sent' || inv.status === 'Partially Paid') {
                pendingPayments += Math.max(0, outstanding);
            }
            if (inv.status === 'Overdue') {
                overdueAmount += Math.max(0, outstanding);
            }
        });

        const monthlyRevenue = Object.keys(monthlyMap).sort().map(m => ({
            month: m,
            revenue: parseFloat(monthlyMap[m].toFixed(2))
        }));

        const clientRevenue = Object.entries(clientMap)
            .map(([name, revenue]) => ({ name, revenue: parseFloat(revenue.toFixed(2)) }))
            .sort((a, b) => b.revenue - a.revenue);

        const projectRevenue = Object.entries(projectMap)
            .map(([name, d]) => ({ name, billed: parseFloat(d.billed.toFixed(2)), paid: parseFloat(d.paid.toFixed(2)) }))
            .sort((a, b) => b.billed - a.billed);

        const statusDistribution = Object.entries(statusCount).map(([status, count]) => ({ status, count }));

        const paidVsOutstanding = [
            { name: 'Paid', value: parseFloat(totalPaidAll.toFixed(2)) },
            { name: 'Outstanding', value: parseFloat(totalOutstandingAll.toFixed(2)) }
        ].filter(d => d.value > 0);

        const methodDistribution = Object.entries(methodMap)
            .map(([method, amount]) => ({ method, amount: parseFloat(amount.toFixed(2)) }));

        res.json({
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            pendingPayments: parseFloat(pendingPayments.toFixed(2)),
            overdueAmount: parseFloat(overdueAmount.toFixed(2)),
            paidThisMonth: parseFloat(paidThisMonth.toFixed(2)),
            monthlyRevenue,
            clientRevenue,
            projectRevenue,
            statusDistribution,
            paidVsOutstanding,
            methodDistribution,
            invoiceCount: all.length,
            paymentCount: allPayments.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
    try {
        const filter = req.user.role === 'freelancer'
            ? { _id: req.params.id, freelancer: req.user._id }
            : { _id: req.params.id, createdBy: req.user._id };

        const inv = await Invoice.findOne(filter)
            .populate('client', 'fullName email phone address')
            .populate('freelancer', 'fullName email')
            .populate('project', 'name')
            .populate('items.taskId', 'title');
        if (!inv) return res.status(404).json({ message: 'Invoice not found' });
        res.json(inv);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/invoices
export const createInvoice = async (req, res) => {
    try {
        if (req.user.role !== 'client') return res.status(403).json({ message: 'Only clients can create payment documents' });

        const proj = await Project.findById(req.body.project);
        if (!proj) return res.status(404).json({ message: 'Project not found' });
        if (!proj.platformClient || proj.platformClient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not own this project' });
        }
        if (!proj.createdBy) return res.status(400).json({ message: 'This project has no assigned freelancer' });
        if (!proj.projectRequest) return res.status(400).json({ message: 'Invoices can only be created for accepted projects' });

        // Prevent duplicate invoices for the same project
        const existing = await Invoice.findOne({ client: req.user._id, project: proj._id, freelancer: proj.createdBy })
            .populate('client', 'fullName email')
            .populate('project', 'name');
        if (existing) {
            return res.status(409).json({ message: 'An invoice already exists for this project', invoice: existing });
        }

        const { items = [], taxRate = 0, discount = 0, issueDate, dueDate, notes = '', terms = '' } = req.body;
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'At least one invoice item is required' });
        if (!dueDate) return res.status(400).json({ message: 'Due date is required' });
        const issue = new Date(issueDate || Date.now());
        const due = new Date(dueDate);
        if (Number.isNaN(issue.getTime()) || Number.isNaN(due.getTime()) || due < issue) {
            return res.status(400).json({ message: 'Due date must be on or after the invoice date' });
        }
        const sanitizedItems = items.map((item) => {
            const quantity = Number(item.quantity ?? 1);
            const rate = Number(item.rate ?? 0);
            const hours = Number(item.hours ?? 0);
            const amount = Number(item.amount ?? (hours > 0 ? hours * rate : quantity * rate));
            if (!item.description?.trim() || !Number.isFinite(amount) || amount < 0) {
                throw new Error('Each invoice item requires a description and valid amount');
            }
            return { ...item, quantity, rate, hours, amount, taskId: item.taskId || null };
        });
        const safeTaxRate = Number.isFinite(Number(taxRate)) ? Number(taxRate) : 0;
        const safeDiscount = Number.isFinite(Number(discount)) ? Number(discount) : 0;
        const { subtotal, taxAmount, total } = calcTotals(sanitizedItems, safeTaxRate, safeDiscount);

        const inv = new Invoice({
            project: proj._id,
            issueDate: issue, dueDate: due,
            items: sanitizedItems, taxRate: safeTaxRate, discount: safeDiscount,
            subtotal, taxAmount, total, notes, terms,
            status: 'Draft',
            createdBy: req.user._id,
            freelancer: proj.createdBy,
            client: req.user._id
        });
        await inv.save();
        await inv.populate('client', 'fullName email');
        await inv.populate('freelancer', 'fullName email');
        await inv.populate('project', 'name');
        res.status(201).json(inv);
    } catch (err) {
        if (err?.code === 11000) {
            const invoice = await Invoice.findOne({ client: req.user._id, project: req.body.project })
                .populate('client', 'fullName email').populate('project', 'name');
            return res.status(409).json({ message: 'An invoice already exists for this project', invoice });
        }
        res.status(400).json({ message: err.message });
    }
};

// PUT /api/invoices/:id
export const updateInvoice = async (req, res) => {
    try {
        if (req.user.role === 'freelancer') {
            return res.status(403).json({ message: 'Freelancers cannot edit payment documents' });
        }

        const inv = await Invoice.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!inv) return res.status(404).json({ message: 'Invoice not found' });
        if (inv.status !== 'Draft') return res.status(400).json({ message: 'Only Draft invoices can be fully edited.' });

        const { items = inv.items, taxRate = inv.taxRate, discount = inv.discount, client, freelancer, project, createdBy, status, ...rest } = req.body;
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'At least one invoice item is required' });
        const nextIssueDate = new Date(rest.issueDate || inv.issueDate);
        const nextDueDate = new Date(rest.dueDate || inv.dueDate);
        if (Number.isNaN(nextIssueDate.getTime()) || Number.isNaN(nextDueDate.getTime()) || nextDueDate < nextIssueDate) {
            return res.status(400).json({ message: 'Due date must be on or after the invoice date' });
        }
        const sanitizedItems = items.map((item) => {
            const quantity = Number(item.quantity ?? 1);
            const rate = Number(item.rate ?? 0);
            const hours = Number(item.hours ?? 0);
            const amount = Number(item.amount ?? (hours > 0 ? hours * rate : quantity * rate));
            if (!item.description?.trim() || !Number.isFinite(amount) || amount < 0) {
                throw new Error('Each invoice item requires a description and valid amount');
            }
            return { ...item, quantity, rate, hours, amount, taskId: item.taskId || null };
        });
        const safeTaxRate = Number.isFinite(Number(taxRate)) ? Number(taxRate) : 0;
        const safeDiscount = Number.isFinite(Number(discount)) ? Number(discount) : 0;
        const { subtotal, taxAmount, total } = calcTotals(sanitizedItems, safeTaxRate, safeDiscount);
        Object.assign(inv, { ...rest, items: sanitizedItems, taxRate: safeTaxRate, discount: safeDiscount, subtotal, taxAmount, total });
        await inv.save();
        await inv.populate('client', 'fullName email');
        await inv.populate('freelancer', 'fullName email');
        await inv.populate('project', 'name');
        res.json(inv);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE /api/invoices/:id
export const deleteInvoice = async (req, res) => {
    try {
        if (req.user.role === 'freelancer') {
            return res.status(403).json({ message: 'Freelancers cannot delete payment documents' });
        }

        const inv = await Invoice.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!inv) return res.status(404).json({ message: 'Invoice not found' });
        if (inv.status !== 'Draft') return res.status(400).json({ message: 'Only Draft invoices can be deleted.' });
        await inv.deleteOne();
        res.json({ message: 'Invoice deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/invoices/:id/duplicate
export const duplicateInvoice = async (req, res) => {
    try {
        if (req.user.role === 'freelancer') {
            return res.status(403).json({ message: 'Freelancers cannot duplicate payment documents' });
        }

        const orig = await Invoice.findOne({ _id: req.params.id, createdBy: req.user._id }).lean();
        if (!orig) return res.status(404).json({ message: 'Invoice not found' });
        return res.status(409).json({ message: 'An invoice already exists for this project', invoice: orig });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// PATCH /api/invoices/:id/status
export const changeStatus = async (req, res) => {
    try {
        if (req.user.role === 'freelancer') {
            return res.status(403).json({ message: 'Freelancers cannot mutate payment documents' });
        }

        const { status, paidAmount } = req.body;
        const inv = await Invoice.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!inv) return res.status(404).json({ message: 'Invoice not found' });

        inv.status = status;
        if (status === 'Sent' && !inv.sentAt) inv.sentAt = new Date();
        if (status === 'Paid') { inv.paidAmount = inv.total; inv.paidAt = new Date(); }
        if (status === 'Partially Paid' && paidAmount !== undefined) inv.paidAmount = paidAmount;
        await inv.save();
        await inv.populate('client', 'fullName email');
        await inv.populate('project', 'name');
        res.json(inv);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET /api/invoices/client/:clientId  (billing summary for a client)
export const getClientInvoices = async (req, res) => {
    try {
        const filter = req.user.role === 'freelancer'
            ? { client: req.params.clientId, freelancer: req.user._id }
            : { client: req.params.clientId, createdBy: req.user._id };

        const invoices = await Invoice.find(filter)
            .populate('project', 'name')
            .sort({ createdAt: -1 });

        const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
        const totalPaid = invoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
        const outstanding = totalBilled - totalPaid;

        res.json({ invoices, totalBilled, totalPaid, outstanding });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
