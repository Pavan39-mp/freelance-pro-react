import TimerSession from '../models/TimerSession.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

// Helper to update task worked hours
const syncTaskWorkedHours = async (taskId) => {
    const sessions = await TimerSession.find({ taskId });
    const totalSeconds = sessions.reduce((acc, sess) => acc + (sess.duration || 0), 0);
    const totalHours = Number((totalSeconds / 3600).toFixed(2));
    
    await Task.findByIdAndUpdate(taskId, { workedHours: totalHours });
    return totalHours;
};

// @desc    Start a timer session
// @route   POST /api/timer/start
// @access  Private
export const startTimer = async (req, res, next) => {
    try {
        const { taskId, projectId } = req.body;

        // Check if there's already an active timer for this user
        const activeTimer = await TimerSession.findOne({ createdBy: req.user._id, isActive: true });
        if (activeTimer) {
            // Stop the active timer first
            activeTimer.endTime = new Date();
            activeTimer.duration = Math.floor((activeTimer.endTime - activeTimer.startTime) / 1000);
            activeTimer.isActive = false;
            await activeTimer.save();
            await syncTaskWorkedHours(activeTimer.taskId);
        }

        const session = await TimerSession.create({
            taskId,
            projectId,
            createdBy: req.user._id,
            startTime: new Date(),
            isActive: true
        });

        res.status(201).json(session);
    } catch (error) {
        next(error);
    }
};

// @desc    Stop (or pause) an active timer session
// @route   PUT /api/timer/:id/stop
// @access  Private
export const stopTimer = async (req, res, next) => {
    try {
        const session = await TimerSession.findOne({ _id: req.params.id, createdBy: req.user._id });
        
        if (!session) {
            res.status(404);
            throw new Error('Timer session not found');
        }

        if (!session.isActive) {
            return res.status(200).json(session);
        }

        session.endTime = new Date();
        session.duration = Math.floor((session.endTime - session.startTime) / 1000);
        session.isActive = false;
        
        await session.save();
        await syncTaskWorkedHours(session.taskId);

        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a manual time entry
// @route   POST /api/timer/manual
// @access  Private
export const addManualEntry = async (req, res, next) => {
    try {
        const { taskId, projectId, date, durationSeconds, note } = req.body;

        const startTime = new Date(date);
        const endTime = new Date(startTime.getTime() + durationSeconds * 1000);

        const session = await TimerSession.create({
            taskId,
            projectId,
            createdBy: req.user._id,
            startTime,
            endTime,
            duration: durationSeconds,
            isManual: true,
            note,
            isActive: false
        });

        await syncTaskWorkedHours(taskId);

        res.status(201).json(session);
    } catch (error) {
        next(error);
    }
};

// @desc    Edit a timer session
// @route   PUT /api/timer/:id
// @access  Private
export const editEntry = async (req, res, next) => {
    try {
        const { startTime, endTime, durationSeconds, note } = req.body;
        
        const session = await TimerSession.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!session) {
            res.status(404);
            throw new Error('Timer session not found');
        }

        if (startTime) session.startTime = new Date(startTime);
        if (endTime) session.endTime = new Date(endTime);
        if (durationSeconds !== undefined) session.duration = durationSeconds;
        if (note !== undefined) session.note = note;

        await session.save();
        await syncTaskWorkedHours(session.taskId);

        res.status(200).json(session);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a timer session
// @route   DELETE /api/timer/:id
// @access  Private
export const deleteEntry = async (req, res, next) => {
    try {
        const session = await TimerSession.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!session) {
            res.status(404);
            throw new Error('Timer session not found');
        }

        const taskId = session.taskId;
        await TimerSession.deleteOne({ _id: req.params.id });
        
        await syncTaskWorkedHours(taskId);

        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all sessions for a specific task
// @route   GET /api/timer/task/:taskId
// @access  Private
export const getTaskSessions = async (req, res, next) => {
    try {
        const sessions = await TimerSession.find({ 
            taskId: req.params.taskId, 
            createdBy: req.user._id 
        }).sort({ startTime: -1 });

        res.status(200).json(sessions);
    } catch (error) {
        next(error);
    }
};

// @desc    Get active session for current user
// @route   GET /api/timer/active
// @access  Private
export const getActiveSession = async (req, res, next) => {
    try {
        const activeTimer = await TimerSession.findOne({ 
            createdBy: req.user._id, 
            isActive: true 
        });

        res.status(200).json(activeTimer || null);
    } catch (error) {
        next(error);
    }
};

// @desc    Get time summary for dashboard/analytics
// @route   GET /api/timer/summary
// @access  Private
export const getTimeSummary = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // Boundaries
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday start
        
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const allSessions = await TimerSession.find({ createdBy: userId, isActive: false });

        let hoursToday = 0;
        let hoursThisWeek = 0;
        let hoursThisMonth = 0;
        const projectMap = {};

        allSessions.forEach(s => {
            const durationHours = (s.duration || 0) / 3600;
            const sTime = new Date(s.startTime); // Use start time for bucketing

            if (sTime >= todayStart) hoursToday += durationHours;
            if (sTime >= weekStart) hoursThisWeek += durationHours;
            if (sTime >= monthStart) hoursThisMonth += durationHours;

            if (s.projectId) {
                const pid = s.projectId.toString();
                projectMap[pid] = (projectMap[pid] || 0) + durationHours;
            }
        });

        // Find most worked project
        let mostWorkedProjectId = null;
        let maxProjectHours = 0;
        for (const [pid, hours] of Object.entries(projectMap)) {
            if (hours > maxProjectHours) {
                maxProjectHours = hours;
                mostWorkedProjectId = pid;
            }
        }

        let mostWorkedProject = null;
        let mostWorkedClient = null;

        if (mostWorkedProjectId) {
            mostWorkedProject = await Project.findById(mostWorkedProjectId).populate('client');
            if (mostWorkedProject && mostWorkedProject.client) {
                mostWorkedClient = mostWorkedProject.client;
            }
        }

        res.status(200).json({
            hoursToday: Number(hoursToday.toFixed(2)),
            hoursThisWeek: Number(hoursThisWeek.toFixed(2)),
            hoursThisMonth: Number(hoursThisMonth.toFixed(2)),
            mostWorkedProject,
            mostWorkedClient,
            projectHoursMap: projectMap
        });

    } catch (error) {
        next(error);
    }
};
