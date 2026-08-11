import React from 'react';
import { FileText, Image as ImageIcon, FileCode, Download, Trash2 } from 'lucide-react';

const FileCard = ({ file, onDownload, onDelete, showDelete = false }) => {

    // Resolve absolute URL to Express backend reliably in case it's a relative path
    const getFileUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const serverUrl = baseUrl.replace('/api', '');
        return `${serverUrl}${url.startsWith('/') ? url : `/${url}`}`;
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

    const formatSize = (bytesOrString) => {
        if (typeof bytesOrString === 'string' && bytesOrString.includes('MB')) return bytesOrString;
        const bytes = Number(bytesOrString);
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const fileName = file.originalName || file.fileName || file.name || 'Unknown File';
    const mimeType = file.mimeType || file.type || '';
    const category = getCategory(mimeType, fileName);
    const resolvedUrl = getFileUrl(file.url || file.fileUrl);

    // Display Date intelligently 
    let displayDate = 'Just now';
    if (file.createdAt || file.date) {
        const d = new Date(file.createdAt || file.date);
        displayDate = isNaN(d.getTime()) ? (file.date || '') : d.toLocaleDateString();
    }

    const forceDownload = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onDownload) {
            await onDownload(file);
            return;
        }

        // Prevent default fetch on blob URLs and data URIs
        if (resolvedUrl.startsWith('blob:') || resolvedUrl.startsWith('data:')) {
            const tempLink = document.createElement('a');
            tempLink.href = resolvedUrl;
            tempLink.download = fileName;
            tempLink.click();
            return;
        }

        try {
            const res = await fetch(resolvedUrl);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const tempLink = document.createElement('a');
            tempLink.href = url;
            tempLink.download = fileName;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download fallback to open:", error);
            window.open(resolvedUrl, '_blank');
        }
    };

    return (
        <div className="relative flex items-center gap-3 p-3 bg-surface-container-high hover:bg-surface-container-highest cursor-pointer rounded-xl border border-outline-variant/10 transition-colors group">

            {/* Absolute positioning link to make whole card perfectly responsive to browser targeting safely */}
            {!onDownload && resolvedUrl !== '#' && (
                <a
                    href={resolvedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 rounded-xl"
                    aria-label={`Open ${fileName}`}
                />
            )}

            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 font-bold relative z-10 pointer-events-none">
                {category === 'PDF' && <FileText className="w-5 h-5" />}
                {category === 'Images' && <ImageIcon className="w-5 h-5 animate-in fade-in" />}
                {category === 'Documents' && <FileCode className="w-5 h-5" />}
                {category === 'Other' && <FileText className="w-5 h-5" />}
            </div>

            <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                <p className="text-body-sm font-bold text-on-surface truncate">{fileName}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                    {formatSize(file.size)} • {displayDate}
                </p>
            </div>

            <div className="flex gap-1 relative z-20">
                <button
                    onClick={forceDownload}
                    className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                    title="Download File"
                >
                    <Download className="w-4 h-4" />
                </button>

                {showDelete && onDelete && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(file._id || file.id);
                        }}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors"
                        title="Delete File"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FileCard;
