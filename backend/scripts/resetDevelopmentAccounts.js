import 'dotenv/config';
import mongoose from 'mongoose';
import Activity from '../models/Activity.js';
import Client from '../models/Client.js';
import Comment from '../models/Comment.js';
import Conversation from '../models/Conversation.js';
import File from '../models/File.js';
import Invoice from '../models/Invoice.js';
import Meeting from '../models/Meeting.js';
import Message from '../models/Message.js';
import Note from '../models/Note.js';
import Notification from '../models/Notification.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';
import ProjectRequest from '../models/ProjectRequest.js';
import Task from '../models/Task.js';
import TimerSession from '../models/TimerSession.js';
import User from '../models/User.js';

const isDryRun = process.argv.includes('--dry-run');
const roleFilter = { role: { $regex: /^\s*(client|freelancer)\s*$/i } };
const ids = (documents) => documents.map((document) => document._id);
const inIds = (values) => ({ $in: values });

const refuseUnsafeTarget = (databaseName) => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Refusing to reset accounts because NODE_ENV is production.');
    }
    if (process.env.NODE_ENV !== 'development') {
        throw new Error('Refusing to reset accounts unless NODE_ENV is explicitly development.');
    }
    if (!databaseName || /prod(uction)?/i.test(databaseName)) {
        throw new Error(`Refusing to reset unsafe database name: ${databaseName || '(unknown)'}.`);
    }
};

const buildResetPlan = async () => {
    const users = await User.find(roleFilter).select('_id role').lean();
    const userIds = ids(users);

    const clientRecords = await Client.find({ createdBy: inIds(userIds) }).select('_id').lean();
    const clientRecordIds = ids(clientRecords);

    const projectRequests = await ProjectRequest.find({
        $or: [{ client: inIds(userIds) }, { freelancer: inIds(userIds) }]
    }).select('_id').lean();
    const projectRequestIds = ids(projectRequests);

    const projects = await Project.find({
        $or: [
            { createdBy: inIds(userIds) },
            { platformClient: inIds(userIds) },
            { client: inIds(clientRecordIds) },
            { projectRequest: inIds(projectRequestIds) }
        ]
    }).select('_id').lean();
    const projectIds = ids(projects);

    const tasks = await Task.find({
        $or: [{ createdBy: inIds(userIds) }, { projectId: inIds(projectIds) }]
    }).select('_id').lean();
    const taskIds = ids(tasks);

    const conversations = await Conversation.find({
        $or: [{ client: inIds(userIds) }, { freelancer: inIds(userIds) }]
    }).select('_id').lean();
    const conversationIds = ids(conversations);

    const invoices = await Invoice.find({
        $or: [
            { client: inIds(userIds) },
            { freelancer: inIds(userIds) },
            { createdBy: inIds(userIds) },
            { project: inIds(projectIds) }
        ]
    }).select('_id').lean();
    const invoiceIds = ids(invoices);

    const filters = {
        messages: {
            model: Message,
            filter: { $or: [{ conversation: inIds(conversationIds) }, { sender: inIds(userIds) }, { receiver: inIds(userIds) }] }
        },
        payments: {
            model: Payment,
            filter: { $or: [{ invoice: inIds(invoiceIds) }, { client: inIds(userIds) }, { createdBy: inIds(userIds) }, { project: inIds(projectIds) }] }
        },
        files: {
            model: File,
            filter: { $or: [{ uploadedBy: inIds(userIds) }, { projectId: inIds(projectIds) }, { taskId: inIds(taskIds) }] }
        },
        timerSessions: {
            model: TimerSession,
            filter: { $or: [{ createdBy: inIds(userIds) }, { projectId: inIds(projectIds) }, { taskId: inIds(taskIds) }] }
        },
        comments: {
            model: Comment,
            filter: { $or: [{ createdBy: inIds(userIds) }, { projectId: inIds(projectIds) }, { taskId: inIds(taskIds) }] }
        },
        notes: {
            model: Note,
            filter: { $or: [{ createdBy: inIds(userIds) }, { project: inIds(projectIds) }, { client: inIds(clientRecordIds) }] }
        },
        tasks: { model: Task, filter: { _id: inIds(taskIds) } },
        invoices: { model: Invoice, filter: { _id: inIds(invoiceIds) } },
        meetings: { model: Meeting, filter: { user: inIds(userIds) } },
        notifications: { model: Notification, filter: { user: inIds(userIds) } },
        activities: { model: Activity, filter: { userRef: inIds(userIds) } },
        conversations: { model: Conversation, filter: { _id: inIds(conversationIds) } },
        projects: { model: Project, filter: { _id: inIds(projectIds) } },
        projectRequests: { model: ProjectRequest, filter: { _id: inIds(projectRequestIds) } },
        clients: { model: Client, filter: { _id: inIds(clientRecordIds) } },
        users: { model: User, filter: { _id: inIds(userIds) } }
    };

    const counts = {};
    for (const [name, entry] of Object.entries(filters)) {
        counts[name] = await entry.model.countDocuments(entry.filter);
    }

    return { filters, counts };
};

const printSummary = (heading, summary) => {
    console.log(`\n${heading}`);
    for (const [collection, count] of Object.entries(summary)) {
        console.log(`- ${collection}: ${count}`);
    }
};

const run = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not configured.');
    }

    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const databaseName = mongoose.connection.name;
    refuseUnsafeTarget(databaseName);

    console.log('Environment: development');
    console.log(`Database: ${databaseName}`);

    const { filters, counts } = await buildResetPlan();
    printSummary('Records matched for deletion:', counts);

    if (isDryRun) {
        console.log('\nDry run complete. No documents were deleted.');
        return;
    }

    const deleted = {};
    for (const [name, entry] of Object.entries(filters)) {
        const result = await entry.model.deleteMany(entry.filter);
        deleted[name] = result.deletedCount;
    }

    printSummary('Deletion summary:', deleted);
    console.log('\nDevelopment account reset completed successfully.');
};

try {
    await run();
    await mongoose.disconnect();
    process.exit(0);
} catch (error) {
    console.error(`Reset failed: ${error.message}`);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
}
