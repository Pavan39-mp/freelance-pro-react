import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';

// @desc    Get dashboard and analytics data
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const range = req.query.range || '30days';

        let startDate = new Date();
        let endDate = new Date();

        if (req.query.startDate && req.query.endDate) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
        } else {
            if (range === 'today') {
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            } else if (range === 'yesterday') {
                startDate.setDate(startDate.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(endDate.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
            } else if (range === '7days') {
                startDate.setDate(startDate.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            } else if (range === '90days') {
                startDate.setDate(startDate.getDate() - 90);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            } else if (range === '12months') {
                startDate.setMonth(startDate.getMonth() - 12);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            } else { // default '30days'
                startDate.setDate(startDate.getDate() - 30);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
            }
        }

        // Align boundaries
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Gather all user's data
        const clients = await Client.find({ createdBy: userId, archived: false }).sort({ createdAt: -1 });
        const projects = await Project.find({ createdBy: userId }).populate('client').sort({ createdAt: -1 });
        const tasks = await Task.find({ createdBy: userId }).sort({ createdAt: -1 });
        const payments = await Payment.find({ createdBy: userId }).sort({ paymentDate: -1 });
        const invoices = await Invoice.find({ createdBy: userId }).sort({ createdAt: -1 });

        // Filter projects, clients and tasks that exist in/before this period
        const matchingProjects = projects.filter(p => new Date(p.createdAt) <= endDate);
        const matchingTasks = tasks.filter(t => new Date(t.createdAt) <= endDate);
        const matchingClients = clients.filter(c => new Date(c.createdAt) <= endDate);

        // Generates Chart Data day-by-day
        const chartData = [];
        let currentDate = new Date(startDate);
        let totalRevenue = 0;
        let totalWorkedHours = 0;

        while (currentDate <= endDate) {
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);

            let dayRevenue = 0;
            let dayWorked = 0;

            tasks.forEach(t => {
                const taskDate = new Date(t.updatedAt || t.createdAt);
                if (taskDate >= dayStart && taskDate <= dayEnd) {
                    dayWorked += (t.workedHours || 0);
                }
            });
            payments.forEach(p => {
                const pDate = new Date(p.paymentDate);
                if (pDate >= dayStart && pDate <= dayEnd) {
                    dayRevenue += p.amount;
                }
            });

            const dayExpenses = dayRevenue * 0.15;
            totalRevenue += dayRevenue;
            totalWorkedHours += dayWorked;

            chartData.push({
                date: currentDate.toISOString(),
                dateStr: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: dayRevenue,
                projects: projects.filter(p => new Date(p.createdAt) <= dayEnd).length,
                completedTasks: tasks.filter(t => t.status === 'Completed' && new Date(t.updatedAt || t.createdAt) <= dayEnd).length,
                pendingTasks: tasks.filter(t => t.status !== 'Completed' && new Date(t.updatedAt || t.createdAt) <= dayEnd).length,
                activeClients: clients.filter(c => c.status === 'Active' && new Date(c.createdAt) <= dayEnd).length,
                expenses: dayExpenses,
                profit: dayRevenue - dayExpenses,
                workedHours: dayWorked
            });

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Calculate aggregates for summary cards
        const expenses = totalRevenue * 0.15;
        const profit = totalRevenue - expenses;

        // Group status counts from filtered tasks
        const completedTasksCount = matchingTasks.filter(t => t.status === 'Completed').length;
        const inProgressTasksCount = matchingTasks.filter(t => t.status === 'In Progress').length;
        const todoTasksCount = matchingTasks.filter(t => t.status === 'To Do').length;

        const pieData = [
            { name: 'Completed', value: completedTasksCount },
            { name: 'In Progress', value: inProgressTasksCount },
            { name: 'To Do', value: todoTasksCount }
        ].filter(item => item.value > 0);

        const aggregates = {
            revenue: totalRevenue,
            activeClients: matchingClients.filter(c => c.status === 'Active').length,
            completedProjects: matchingProjects.filter(p => p.status === 'Completed').length,
            pendingTasks: matchingTasks.filter(t => t.status !== 'Completed').length,
            totalEarnings: totalRevenue,
            profit,
            expenses,
            completionRate: matchingTasks.length > 0
                ? Math.round((completedTasksCount / matchingTasks.length) * 100)
                : 0
        };

        // Construct cleaned entities for reporting
        const reportClients = matchingClients.map(c => {
            const clientProjects = matchingProjects.filter(p => p.client?._id?.toString() === c._id.toString() || p.client?.toString() === c._id.toString());
            const clientTasks = matchingTasks.filter(t => {
                const proj = matchingProjects.find(p => p._id.toString() === t.projectId?.toString());
                return proj && (proj.client?._id?.toString() === c._id.toString() || proj.client?.toString() === c._id.toString());
            });

            let billing = 0;
            // Integrate Native Revenue Instead of Synthetic Project Projections
            invoices.forEach(inv => {
                if (inv.client?.toString() === c._id.toString()) {
                    billing += (inv.paidAmount || 0);
                }
            });

            return {
                _id: c._id,
                name: c.fullName || c.name || '',
                company: c.company || '',
                status: c.status || 'Active',
                industry: c.industry || '',
                projectCount: clientProjects.length,
                activeProjects: clientProjects.filter(p => p.status !== 'Completed').length,
                completedProjects: clientProjects.filter(p => p.status === 'Completed').length,
                billing
            };
        });

        const reportProjects = matchingProjects.map(p => {
            const projectTasks = matchingTasks.filter(t => t.projectId?.toString() === p._id.toString());
            const worked = projectTasks.reduce((sum, t) => sum + (t.workedHours || 0), 0);
            const estimated = projectTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

            let revenue = 0;
            if (p.hourlyRate > 0) {
                revenue = p.hourlyRate * worked;
            } else {
                revenue = p.budget * (p.progress / 100);
            }

            return {
                _id: p._id,
                name: p.name,
                clientName: p.client?.fullName || p.client?.name || 'Internal',
                status: p.status,
                priority: p.priority,
                budget: p.budget || 0,
                hourlyRate: p.hourlyRate || 0,
                progress: p.progress || 0,
                startDate: p.startDate || '',
                dueDate: p.dueDate || '',
                workedHours: worked,
                estimatedHours: estimated,
                revenue,
                createdAt: p.createdAt
            };
        });

        const reportTasks = matchingTasks.map(t => {
            const proj = matchingProjects.find(p => p._id.toString() === t.projectId?.toString());
            return {
                _id: t._id,
                title: t.title,
                projectTitle: proj ? proj.name : 'Internal',
                clientName: proj ? (proj.client?.fullName || proj.client?.name || '') : '',
                status: t.status,
                priority: t.priority,
                progress: t.progress,
                estimatedHours: t.estimatedHours || 0,
                workedHours: t.workedHours || 0,
                deadline: t.deadline || '',
                createdAt: t.createdAt
            };
        });

        res.json({
            success: true,
            message: 'Analytics data retrieved',
            data: {
                chartData,
                aggregates,
                pieData,
                isEmpty: matchingProjects.length === 0 && matchingTasks.length === 0,
                clients: reportClients,
                projects: reportProjects,
                tasks: reportTasks
            }
        });

    } catch (error) {
        next(error);
    }
};
