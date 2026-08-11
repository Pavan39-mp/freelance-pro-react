import Client from '../models/Client.js';
import FreelancerReview from '../models/FreelancerReview.js';
import Invoice from '../models/Invoice.js';
import Meeting from '../models/Meeting.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const clamp = value => Math.max(0, Math.min(100, Math.round(value || 0)));
const validDate = value => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};
const averageAvailable = entries => {
    const available = entries.filter(entry => Number.isFinite(entry.value));
    if (available.length === 0) return null;
    const weight = available.reduce((sum, entry) => sum + entry.weight, 0);
    return clamp(available.reduce((sum, entry) => sum + entry.value * entry.weight, 0) / weight);
};

export const calculateProductivity = async freelancerId => {
    const [tasks, projects, reviews] = await Promise.all([
        Task.find({ createdBy: freelancerId }).select('status deadline updatedAt').lean(),
        Project.find({ createdBy: freelancerId }).select('status dueDate updatedAt').lean(),
        FreelancerReview.find({ freelancer: freelancerId }).select('rating').lean()
    ]);

    const completedTasks = tasks.filter(task => task.status === 'Completed');
    const completedProjects = projects.filter(project => project.status === 'Completed');
    const taskCompletion = tasks.length ? clamp(completedTasks.length / tasks.length * 100) : 0;
    const projectSuccess = projects.length ? clamp(completedProjects.length / projects.length * 100) : 0;
    const datedDeliveries = [
        ...completedTasks.map(item => ({ deadline: validDate(item.deadline), completedAt: validDate(item.updatedAt) })),
        ...completedProjects.map(item => ({ deadline: validDate(item.dueDate), completedAt: validDate(item.updatedAt) }))
    ].filter(item => item.deadline && item.completedAt);
    const onTime = datedDeliveries.filter(item => item.completedAt <= new Date(item.deadline.getTime() + DAY_MS)).length;
    const deliveryPerformance = datedDeliveries.length ? clamp(onTime / datedDeliveries.length * 100) : null;
    const clientFeedback = reviews.length
        ? clamp(reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length / 5 * 100)
        : null;

    const score = averageAvailable([
        { value: taskCompletion, weight: 35 },
        { value: deliveryPerformance, weight: 25 },
        { value: projectSuccess, weight: 25 },
        { value: clientFeedback, weight: 15 }
    ]);

    return {
        score: score ?? 0,
        breakdown: { taskCompletion, deliveryPerformance, projectSuccess, clientFeedback },
        evidence: {
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            totalProjects: projects.length,
            completedProjects: completedProjects.length,
            datedDeliveries: datedDeliveries.length,
            clientReviews: reviews.length,
            activeProjects: projects.filter(project => project.status === 'In Progress').length
        },
        hasData: tasks.length > 0 || projects.length > 0 || reviews.length > 0
    };
};

export const calculateClientReliability = async ({ projects, platformClientId, clientName }) => {
    const projectIds = projects.map(project => project._id);
    const invoiceQuery = projectIds.length ? { project: { $in: projectIds } } : { _id: null };
    const meetingQuery = platformClientId
        ? { clientUser: platformClientId }
        : clientName ? { client: clientName } : { _id: null };
    const [invoices, meetings] = await Promise.all([
        Invoice.find(invoiceQuery).select('status total paidAmount dueDate paidAt').lean(),
        Meeting.find(meetingQuery).select('status').lean()
    ]);

    const paymentInvoices = invoices.filter(invoice => !['Draft', 'Cancelled'].includes(invoice.status));
    const totalBilled = paymentInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
    const totalPaid = paymentInvoices.reduce((sum, invoice) => sum + Number(invoice.paidAmount || 0), 0);
    const paymentHistory = totalBilled > 0 ? clamp(totalPaid / totalBilled * 100) : null;
    const projectCompletion = projects.length
        ? clamp(projects.filter(project => project.status === 'Completed').length / projects.length * 100)
        : null;
    const concludedMeetings = meetings.filter(meeting => ['Completed', 'Cancelled'].includes(meeting.status));
    const communication = concludedMeetings.length >= 2
        ? clamp(concludedMeetings.filter(meeting => meeting.status === 'Completed').length / concludedMeetings.length * 100)
        : null;
    const availableMetrics = [paymentHistory, projectCompletion, communication].filter(Number.isFinite);
    const evidenceCount = paymentInvoices.length + projects.length + concludedMeetings.length;
    const hasSufficientData = availableMetrics.length >= 2 && evidenceCount >= 2;

    return {
        score: hasSufficientData ? clamp(availableMetrics.reduce((sum, value) => sum + value, 0) / availableMetrics.length) : null,
        hasSufficientData,
        message: hasSufficientData ? null : 'Building score from project activity',
        breakdown: { paymentHistory, projectCompletion, communication },
        evidence: { invoices: paymentInvoices.length, projects: projects.length, meetings: concludedMeetings.length }
    };
};

export const calculateProjectIntelligence = async project => {
    const tasks = await Task.find({ projectId: project._id })
        .select('status deadline progress isBlocked progressHistory updatedAt')
        .lean();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const pending = tasks.length - completed;
    const overdue = tasks.filter(task => {
        const deadline = validDate(task.deadline);
        return task.status !== 'Completed' && deadline && deadline < now;
    }).length;
    const blocked = tasks.filter(task => task.isBlocked || task.status === 'On Hold').length;
    const completionPercentage = tasks.length ? clamp(completed / tasks.length * 100) : clamp(project.progress);
    const deadline = validDate(project.dueDate);
    const daysRemaining = deadline ? Math.ceil((deadline - now) / DAY_MS) : null;

    let deadlineRisk = 'Low';
    if ((daysRemaining !== null && daysRemaining < 0 && completionPercentage < 100) || overdue > 0) deadlineRisk = 'High';
    else if ((daysRemaining !== null && daysRemaining <= 7 && completionPercentage < 80) || blocked > 0) deadlineRisk = 'Medium';

    let status = 'Healthy';
    if (deadlineRisk === 'High' || blocked >= 2) status = 'At Risk';
    else if (deadlineRisk === 'Medium' || (pending > 0 && completionPercentage < 50)) status = 'Attention Required';

    const insights = [];
    if (daysRemaining !== null) {
        if (daysRemaining < 0) insights.push(`Project deadline passed ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago.`);
        else if (daysRemaining === 0) insights.push('Project deadline is today.');
        else insights.push(`Your project is ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} away from deadline.`);
    } else insights.push('No project deadline is currently configured.');
    if (pending > 0) insights.push(`${pending} task${pending === 1 ? ' is' : 's are'} still pending.`);
    else if (tasks.length > 0) insights.push('All project tasks are completed.');
    else insights.push('No tasks have been added to this project yet.');
    if (overdue > 0) insights.push(`${overdue} task${overdue === 1 ? ' is' : 's are'} overdue.`);
    if (blocked > 0) insights.push(`${blocked} task${blocked === 1 ? ' needs' : 's need'} attention due to blocked or on-hold status.`);
    const weekStart = new Date(Date.now() - 7 * DAY_MS);
    const recentUpdates = tasks.reduce((count, task) => count + (task.progressHistory || []).filter(entry => validDate(entry.date) >= weekStart).length, 0);
    if (recentUpdates > 0) insights.push(`${recentUpdates} progress update${recentUpdates === 1 ? ' was' : 's were'} recorded this week.`);

    let clientReliability = null;
    if (project.platformClient || project.client) {
        const relatedProjects = project.platformClient
            ? await Project.find({ platformClient: project.platformClient }).select('status').lean()
            : await Project.find({ client: project.client }).select('status').lean();
        clientReliability = await calculateClientReliability({
            projects: relatedProjects,
            platformClientId: project.platformClient,
            clientName: project.client?.fullName
        });
    }

    return {
        health: { status, progress: completionPercentage, deadlineRisk, completedTasks: completed, totalTasks: tasks.length, pendingTasks: pending, overdueTasks: overdue, daysRemaining },
        insights: insights.slice(0, 5),
        clientReliability
    };
};

export const buildPortfolio = async freelancerId => {
    const [user, projects] = await Promise.all([
        User.findOne({ _id: freelancerId, role: 'freelancer' }).select('fullName title skills bio portfolio').lean(),
        Project.find({ createdBy: freelancerId, status: 'Completed' })
            .select('name description updatedAt projectRequest')
            .populate('projectRequest', 'category skills')
            .sort({ updatedAt: -1 })
            .lean()
    ]);
    const skills = String(user?.skills || '').split(',').map(skill => skill.trim()).filter(Boolean);
    return {
        professionalTitle: user?.title || '',
        skills,
        portfolioUrl: user?.portfolio || '',
        projects: projects.map(project => ({
            id: project._id,
            title: project.name,
            role: user?.title || '',
            category: project.projectRequest?.category || '',
            technologies: project.projectRequest?.skills || [],
            highlight: project.description || '',
            completedAt: project.updatedAt
        }))
    };
};

export const getOwnedClientReliability = async (clientId, user) => {
    if (user.role === 'client' && String(clientId) === String(user._id)) {
        const projects = await Project.find({ platformClient: user._id }).select('status platformClient').lean();
        return calculateClientReliability({ projects, platformClientId: user._id });
    }
    const client = await Client.findOne({ _id: clientId, createdBy: user._id }).select('fullName');
    if (!client) return null;
    const projects = await Project.find({ client: client._id, createdBy: user._id }).select('status client').lean();
    return calculateClientReliability({ projects, clientName: client.fullName });
};
