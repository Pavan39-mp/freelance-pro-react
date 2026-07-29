import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { Upload, Search, Download, Trash2, FileText, Image, FileCode, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import FileCard from '../ui/FileCard';

const ProjectFilesTab = ({ project }) => {
    const { user } = useUser();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const projectId = project?._id || project?.id;

    const fetchFiles = async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/files/project/${projectId}`);
            if (res?.success) {
                setFiles(res.data || []);
            } else {
                setError('Failed to load files');
            }
        } catch (err) {
            setError(err?.message || 'Failed to fetch project files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [projectId]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const fileObj = e.target.files?.[0];
        if (!fileObj) return;

        if (fileObj.size > 10 * 1024 * 1024) {
            alert('File exceeds 10MB limit!');
            return;
        }

        setUploading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', fileObj);
        formData.append('projectId', projectId);

        try {
            const res = await api.post('/files/upload', formData);
            if (res?.success) {
                fetchFiles();
            } else {
                setError('Upload failed');
            }
        } catch (err) {
            setError(err?.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownload = (fileRecord) => {
        if (fileRecord.url) {
            window.open(fileRecord.url, '_blank');
        } else {
            alert('Download URL not found');
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            const res = await api.delete(`/files/${fileId}`);
            if (res?.success) {
                setFiles(prev => prev.filter(f => f._id !== fileId));
            } else {
                alert('Deletion failed');
            }
        } catch (err) {
            alert(err?.message || 'Delete failed');
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getCategory = (mimeType, filename) => {
        if (!mimeType) return 'Other';
        if (mimeType.startsWith('image/')) return 'Images';
        if (mimeType.includes('pdf')) return 'PDF';
        const nameLower = (filename || '').toLowerCase();
        if (
            mimeType.includes('word') ||
            mimeType.includes('document') ||
            mimeType.includes('text') ||
            nameLower.endsWith('.doc') ||
            nameLower.endsWith('.docx') ||
            nameLower.endsWith('.txt')
        ) return 'Documents';
        return 'Other';
    };

    const filteredFiles = files.filter(f => {
        const matchesSearch = (f.originalName || '').toLowerCase().includes(search.toLowerCase());
        const category = getCategory(f.mimeType, f.originalName);
        if (filter === 'All') return matchesSearch;
        return matchesSearch && category === filter;
    });

    return (
        <div className="space-y-6 animate-in fade-in">
            {user?.role !== 'client' && (
                <>
                    {/* Hidden Input file selector */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {/* Upload Zone */}
                    <div
                        onClick={handleUploadClick}
                        className={`border-2 border-dashed border-outline-variant/30 rounded-2xl p-6 text-center hover:bg-surface-variant/20 hover:border-primary/50 transition-all cursor-pointer group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <Upload className={`w-8 h-8 mx-auto mb-2.5 text-on-surface-variant group-hover:text-primary transition-colors ${uploading ? 'animate-bounce' : ''}`} />
                        <p className="text-body-sm font-bold text-on-surface mb-1">
                            {uploading ? 'Uploading file...' : 'Drag & drop files here, or click to upload'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">PNG, JPG, PDF, DOCX up to 10MB</p>
                    </div>
                </>
            )}

            {error && (
                <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-sm animate-in slide-in-from-top-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search project files..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl text-body-sm text-on-surface py-2 pl-9 pr-4 focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {['All', 'Images', 'Documents', 'PDF', 'Other'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1 rounded-lg text-body-sm transition-all focus:outline-none font-medium shrink-0 ${filter === cat
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface-variant/40 hover:bg-surface-variant text-on-surface-variant'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Files List/Empty State */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-10">
                        <p className="text-body-sm text-on-surface-variant">Loading files...</p>
                    </div>
                ) : filteredFiles.length > 0 ? (
                    filteredFiles.map(file => {
                        return (
                            <FileCard
                                key={file._id}
                                file={file}
                                onDelete={handleDelete}
                                showDelete={user?.role !== 'client'}
                            />
                        );
                    })
                ) : (
                    <div className="text-center py-10 bg-surface-container-low/20 rounded-xl border border-outline-variant/10">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-25 text-on-surface-variant" />
                        <p className="text-body-sm text-on-surface-variant font-medium">No files uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectFilesTab;
