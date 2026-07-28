import React, { useState, useMemo } from 'react';
import { useNotes } from '../context/NoteContext';
import { useClients } from '../context/ClientContext';
import { useProjects } from '../context/ProjectContext';
import { FileText, Plus, Search, Tag, Calendar, Trash2, Edit3, AlertCircle, X, CheckSquare } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const Notes = () => {
    const { notes, addNote, updateNote, deleteNote } = useNotes();
    const { clients } = useClients();
    const { projects } = useProjects();

    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriority, setSelectedPriority] = useState('All');
    const [selectedNote, setSelectedNote] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        client: '',
        project: '',
        priority: 'Medium',
        description: '',
        reminderDate: ''
    });

    // Extract unique categories from notes for filtering
    const categories = useMemo(() => {
        const cats = notes.map(n => n.category).filter(Boolean);
        return ['All', ...new Set(cats)];
    }, [notes]);

    // Filtered Notes list
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            const matchesSearch =
                note.title.toLowerCase().includes(searchText.toLowerCase()) ||
                note.description.toLowerCase().includes(searchText.toLowerCase()) ||
                (note.category ?? '').toLowerCase().includes(searchText.toLowerCase());

            const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
            const matchesPriority = selectedPriority === 'All' || note.priority === selectedPriority;

            return matchesSearch && matchesCategory && matchesPriority;
        });
    }, [notes, searchText, selectedCategory, selectedPriority]);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-error/20 text-error border-error/30';
            case 'Medium': return 'bg-warning/20 text-warning border-warning/30';
            case 'Low': return 'bg-primary/20 text-primary border-primary/30';
            default: return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAdd = () => {
        setFormData({
            title: '',
            category: '',
            client: '',
            project: '',
            priority: 'Medium',
            description: '',
            reminderDate: ''
        });
        setShowAddModal(true);
    };

    const handleOpenEdit = (note) => {
        // Resolve client and project names
        const clientName = note.client?.fullName || note.client?.name || '';
        const projectTitle = note.project?.name || note.project?.title || '';

        setFormData({
            title: note.title,
            category: note.category || '',
            client: clientName,
            project: projectTitle,
            priority: note.priority || 'Medium',
            description: note.description,
            reminderDate: note.reminderDate || ''
        });
        setSelectedNote(note);
        setShowEditModal(true);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return;
        }
        const success = await addNote(formData);
        if (success) {
            setShowAddModal(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return;
        }
        const success = await updateNote(selectedNote._id || selectedNote.id, formData);
        if (success) {
            setShowEditModal(false);
            setSelectedNote(null);
        }
    };

    const handleDeleteClick = (id, title) => {
        if (window.confirm(`Are you sure you want to delete note "${title}"?`)) {
            deleteNote(id);
        }
    };

    return (
        <div className="h-full space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Notes</h2>
                    <p className="text-on-surface-variant font-body-lg">Organize thoughts, map action items, or link comments to specific clients and projects.</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-label-caps text-label-caps font-bold transition-all active:scale-95 duration-200"
                >
                    <Plus className="w-[1.125rem] h-[1.125rem]" />
                    Create Note
                </button>
            </div>

            {/* Toolbar filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-surface-container-low/30 rounded-2xl border border-outline-variant/10">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl py-2 pl-9 pr-4 text-on-surface text-body-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                </div>

                {/* Category select filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
                >
                    <option value="All">All Categories</option>
                    {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                {/* Priority select filter */}
                <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 px-3 focus:outline-none cursor-pointer"
                >
                    <option value="All">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-outline-variant/20 rounded-3xl bg-surface-container-low/10">
                    <FileText className="w-12 h-12 mx-auto text-on-surface-variant opacity-50 mb-3" />
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No notes found</h3>
                    <p className="text-on-surface-variant text-body-md max-w-sm mx-auto">Create checklists or personal guides. Try adjusting query filters or write a note to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map(note => {
                        const clientName = note.client?.fullName || note.client?.name;
                        const projectTitle = note.project?.name || note.project?.title;

                        return (
                            <Card key={note._id || note.id} className="p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group border border-outline-variant/10 relative">
                                {/* Meta details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold tracking-wider ${getPriorityColor(note.priority)}`}>
                                            {note.priority} Note
                                        </span>
                                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenEdit(note)}
                                                className="text-on-surface-variant hover:text-primary transition-colors p-1"
                                                title="Edit Note"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(note._id || note.id, note.title)}
                                                className="text-on-surface-variant hover:text-error transition-colors p-1"
                                                title="Delete Note"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-body-lg font-bold text-on-surface leading-snug group-hover:text-primary transition-all duration-300">{note.title}</h3>
                                        {note.category && (
                                            <p className="text-[10px] text-primary/70 tracking-widest font-bold font-label-caps mt-0.5 flex items-center gap-1.5">
                                                <Tag className="w-3 h-3" /> {note.category}
                                            </p>
                                        )}
                                    </div>

                                    <p className="text-body-sm text-on-surface-variant leading-relaxed line-clamp-4 whitespace-pre-wrap">
                                        {note.description}
                                    </p>
                                </div>

                                {/* Footer specs */}
                                <div className="border-t border-outline-variant/10 pt-4 mt-4 space-y-2">
                                    {(clientName || projectTitle) && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {clientName && (
                                                <span className="bg-surface-variant/40 border border-outline-variant/10 text-on-surface-variant text-[9px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                                    C: {clientName}
                                                </span>
                                            )}
                                            {projectTitle && (
                                                <span className="bg-surface-variant/40 border border-outline-variant/10 text-on-surface-variant text-[9px] font-semibold px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                                    P: {projectTitle}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant/70">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Just now'}
                                        </span>
                                        {note.reminderDate && (
                                            <span className="text-error font-medium flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Reminder: {new Date(note.reminderDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* CREATE NOTE BACKEND MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface">Create Note</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar p-6">
                            <form id="add-note-inline-form" onSubmit={handleAddSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Note Title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="Category"
                                        name="category"
                                        placeholder="e.g. Design, Meeting, Personal"
                                        value={formData.category}
                                        onChange={handleChange}
                                    />

                                    <Input
                                        type="select"
                                        label="Priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        options={["High", "Medium", "Low"]}
                                    />

                                    <Input
                                        type="select"
                                        label="Related Client (Optional)"
                                        name="client"
                                        value={formData.client}
                                        onChange={handleChange}
                                        placeholder="Select a client..."
                                        options={clients.map(c => c.name)}
                                    />

                                    <Input
                                        type="select"
                                        label="Related Project (Optional)"
                                        name="project"
                                        value={formData.project}
                                        onChange={handleChange}
                                        placeholder="Select a project..."
                                        options={projects.map(p => p.title)}
                                    />

                                    <div className="md:col-span-2">
                                        <Input
                                            type="date"
                                            label="Reminder Date (Optional)"
                                            name="reminderDate"
                                            value={formData.reminderDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <Input
                                    type="textarea"
                                    label="Description"
                                    name="description"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                />
                            </form>
                        </div>

                        <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low">
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="add-note-inline-form">
                                Save Note
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT NOTE BACKEND MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-container-high border border-outline-variant/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-outline-variant/10">
                            <h2 className="font-headline-sm text-headline-sm text-on-surface">Edit Note</h2>
                            <button onClick={() => setShowEditModal(false)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto custom-scrollbar p-6">
                            <form id="edit-note-inline-form" onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div className="md:col-span-2">
                                        <Input
                                            label="Note Title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <Input
                                        label="Category"
                                        name="category"
                                        placeholder="e.g. Design, Meeting, Personal"
                                        value={formData.category}
                                        onChange={handleChange}
                                    />

                                    <Input
                                        type="select"
                                        label="Priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        options={["High", "Medium", "Low"]}
                                    />

                                    <Input
                                        type="select"
                                        label="Related Client (Optional)"
                                        name="client"
                                        value={formData.client}
                                        onChange={handleChange}
                                        placeholder="Select a client..."
                                        options={clients.map(c => c.name)}
                                    />

                                    <Input
                                        type="select"
                                        label="Related Project (Optional)"
                                        name="project"
                                        value={formData.project}
                                        onChange={handleChange}
                                        placeholder="Select a project..."
                                        options={projects.map(p => p.title)}
                                    />

                                    <div className="md:col-span-2">
                                        <Input
                                            type="date"
                                            label="Reminder Date (Optional)"
                                            name="reminderDate"
                                            value={formData.reminderDate}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <Input
                                    type="textarea"
                                    label="Description"
                                    name="description"
                                    required
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                />
                            </form>
                        </div>

                        <div className="p-6 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low">
                            <Button variant="outline" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="edit-note-inline-form">
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notes;
