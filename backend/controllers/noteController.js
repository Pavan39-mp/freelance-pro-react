import Note from '../models/Note.js';
import Activity from '../models/Activity.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';

// Helper to log note activity
const logNoteActivity = async (userId, action, noteTitle) => {
    try {
        await Activity.create({
            action: `${action}`,
            taskName: noteTitle,
            type: 'note',
            userRef: userId,
            userName: 'Alex Rivera' // Default user name or can be populated if needed
        });
    } catch (err) {
        console.error('Error logging note activity:', err.message);
    }
};

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { createdBy: req.user._id };

        const safeSearch = typeof search === 'string' ? search : '';
        if (safeSearch) {
            const escapedSearch = safeSearch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            query.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { description: { $regex: escapedSearch, $options: 'i' } },
                { category: { $regex: escapedSearch, $options: 'i' } }
            ];
        }

        const notes = await Note.find(query)
            .populate('client')
            .populate('project')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: notes
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = async (req, res, next) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, createdBy: req.user._id })
            .populate('client')
            .populate('project');

        if (!note) {
            res.status(404);
            throw new Error('Note not found');
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res, next) => {
    try {
        const { title, description, category, priority, client, project, reminderDate } = req.body;

        if (!title) {
            res.status(400);
            throw new Error('Note Title is required');
        }
        if (!description) {
            res.status(400);
            throw new Error('Description is required');
        }

        if (client) {
            const clientExists = await Client.findOne({ _id: client, createdBy: req.user._id });
            if (!clientExists) {
                res.status(403);
                throw new Error('Unauthorized client reference or client not found');
            }
        }

        if (project) {
            const projectExists = await Project.findOne({ _id: project, createdBy: req.user._id });
            if (!projectExists) {
                res.status(403);
                throw new Error('Unauthorized project reference or project not found');
            }
        }

        const note = await Note.create({
            title,
            description,
            category: category || '',
            priority: priority || 'Medium',
            client: client || null,
            project: project || null,
            reminderDate: reminderDate || '',
            createdBy: req.user._id
        });

        // Resolve client/project references if present for populating returning model
        const populatedNote = await Note.findById(note._id)
            .populate('client')
            .populate('project');

        await logNoteActivity(req.user._id, 'created', title);

        res.status(201).json({
            success: true,
            data: populatedNote
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res, next) => {
    try {
        const { title, description, category, priority, client, project, reminderDate } = req.body;

        const note = await Note.findOne({ _id: req.params.id, createdBy: req.user._id });

        if (!note) {
            res.status(404);
            throw new Error('Note not found');
        }

        if (title !== undefined) note.title = title;
        if (description !== undefined) note.description = description;
        if (category !== undefined) note.category = category;
        if (priority !== undefined) note.priority = priority;
        if (client !== undefined) {
            if (client) {
                const clientExists = await Client.findOne({ _id: client, createdBy: req.user._id });
                if (!clientExists) {
                    res.status(403);
                    throw new Error('Unauthorized client reference or client not found');
                }
                note.client = client;
            } else {
                note.client = null;
            }
        }
        if (project !== undefined) {
            if (project) {
                const projectExists = await Project.findOne({ _id: project, createdBy: req.user._id });
                if (!projectExists) {
                    res.status(403);
                    throw new Error('Unauthorized project reference or project not found');
                }
                note.project = project;
            } else {
                note.project = null;
            }
        }
        if (reminderDate !== undefined) note.reminderDate = reminderDate;

        const updatedNote = await note.save();

        // Resolve client/project references if present for populating returning model
        const populatedNote = await Note.findById(updatedNote._id)
            .populate('client')
            .populate('project');

        await logNoteActivity(req.user._id, 'updated', populatedNote.title);

        res.json({
            success: true,
            data: populatedNote
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, createdBy: req.user._id });

        if (!note) {
            res.status(404);
            throw new Error('Note not found');
        }

        await note.deleteOne();
        await logNoteActivity(req.user._id, 'deleted', note.title);

        res.json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
