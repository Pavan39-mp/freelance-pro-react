import React, { useState, useEffect } from 'react';
import { getMyProjectRequests, updateRequestStatus } from '../../services/projectRequestService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useProjects } from '../../context/ProjectContext';
import { useUser } from '../../context/UserContext';
import { Clock, CheckCircle, XCircle, Slash, Calendar, IndianRupee, ClipboardList, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import TextPreview from '../../components/ui/TextPreview';
import ProjectRequestChat from '../../components/projects/ProjectRequestChat';

const ProjectRequests = () => {
    const { user } = useUser();
    const { refreshProjects } = useProjects() || {};
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRequestId, setExpandedRequestId] = useState(null);
    const [activeChatRequestId, setActiveChatRequestId] = useState(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await getMyProjectRequests();
            if (res.success) {
                setRequests(res.data);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load project requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await updateRequestStatus(id, status);
            if (res.success) {
                toast.success(`Request ${status} successfully`);
                fetchRequests(); // Refresh list to get updated data securely

                // Refresh global project context to ensure the newly created project is immediately visible
                if (status === 'accepted') {
                    if (refreshProjects) refreshProjects();
                    window.dispatchEvent(new CustomEvent('refresh-clients'));
                }
            }
        } catch (error) {
            toast.error(error.message || `Failed to update status`);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-5 h-5 text-warning" />;
            case 'accepted': return <CheckCircle className="w-5 h-5 text-success" />;
            case 'rejected': return <XCircle className="w-5 h-5 text-error" />;
            case 'cancelled': return <Slash className="w-5 h-5 text-on-surface-variant" />;
            case 'Open': return <Clock className="w-5 h-5 text-primary" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'accepted': return 'Accepted';
            case 'rejected': return 'Rejected';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12 max-w-6xl mx-auto">
            <div>
                <h1 className="font-title-lg font-bold text-on-surface mb-2">Project Requests</h1>
                <p className="text-body-md text-on-surface-variant">
                    {user?.role === 'client'
                        ? 'Track and manage the project proposals you have sent to freelancers.'
                        : 'Review incoming project proposals from potential clients.'}
                </p>
            </div>

            {requests.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-20 text-center border-dashed">
                    <ClipboardList className="w-16 h-16 text-on-surface-variant/30 mb-4" />
                    <h3 className="font-title-md font-bold text-on-surface">No Requests Found</h3>
                    <p className="text-body-md text-on-surface-variant mt-2 max-w-sm">
                        {user?.role === 'client'
                            ? "You haven't sent any project requests yet. Explore available freelancers to propose a project."
                            : "You haven't received any project requests yet. Keep your profile updated to attract clients."}
                    </p>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <Card key={req._id} className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center justify-between md:justify-start gap-4">
                                        <h3 className="font-title-md font-bold text-on-surface">{req.title}</h3>
                                        <div className="flex items-center gap-2 bg-surface-variant/50 px-3 py-1.5 rounded-full">
                                            {getStatusIcon(req.status)}
                                            <span className="text-label-sm font-semibold capitalize text-on-surface">
                                                {getStatusText(req.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {expandedRequestId === req._id ? (
                                        <p className="text-body-md text-on-surface-variant whitespace-pre-wrap break-words">{req.description}</p>
                                    ) : (
                                        <TextPreview lines={3} className="text-body-md text-on-surface-variant">{req.description}</TextPreview>
                                    )}
                                    {req.description?.length > 180 && <button onClick={() => setExpandedRequestId(expandedRequestId === req._id ? null : req._id)} className="text-[11px] font-bold text-primary hover:text-primary/80">
                                        {expandedRequestId === req._id ? 'Show less' : 'View full description'}
                                    </button>}

                                    <div className="flex flex-wrap items-center gap-4 text-label-md text-on-surface">
                                        <div className="flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-primary" />
                                            <span className="font-semibold">
                                                {req.budget && typeof req.budget === 'object'
                                                    ? `${Number(req.budget.min || 0).toLocaleString('en-IN')} – ${Number(req.budget.max || 0).toLocaleString('en-IN')}`
                                                    : Number(req.budget || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-tertiary" />
                                            <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-on-surface-variant">
                                            {user?.role === 'client' ? (
                                                <span>{req.requestType === 'marketplace' ? 'Public marketplace request' : `To: ${req.freelancer?.fullName || 'Freelancer'}`}</span>
                                            ) : (
                                                <span>From: {req.client?.fullName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Area */}
                                {req.status === 'pending' && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                                        {user?.role === 'client' ? (
                                            <>
                                                <Button variant="outlined" onClick={() => setActiveChatRequestId(activeChatRequestId === req._id ? null : req._id)}>
                                                    <MessageSquare className="w-4 h-4" /> Message Freelancer
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleStatusUpdate(req._id, 'cancelled')}
                                                >
                                                    Cancel Request
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outlined" onClick={() => setActiveChatRequestId(activeChatRequestId === req._id ? null : req._id)}>
                                                    <MessageSquare className="w-4 h-4" /> Message Client
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleStatusUpdate(req._id, 'accepted')}
                                                >
                                                    Accept
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {req.status === 'pending' && activeChatRequestId === req._id && (
                                <ProjectRequestChat projectRequestId={req._id} currentUser={user} />
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectRequests;
