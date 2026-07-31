import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { MapPin, Briefcase, Clock, Globe, ArrowLeft, Tag, CheckCircle, User, Star, FolderCheck } from 'lucide-react';
import { getFreelancerProfile } from '../services/freelancerService';
import { createProjectRequest } from '../services/projectRequestService';
import { createOrGetConversation } from '../services/messageService';
import { useUser } from '../context/UserContext';
import ProjectRequestModal from '../components/modals/ProjectRequestModal';
import toast from 'react-hot-toast';

const EXPERIENCE_LABELS = { entry: 'Entry Level', intermediate: 'Intermediate', expert: 'Expert' };
const AVAILABILITY_LABELS = { 'full-time': 'Full Time', 'part-time': 'Part Time', 'as-needed': 'As Needed' };

const FreelancerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [openingConversation, setOpeningConversation] = useState(false);

    const handleContactFreelancer = async () => {
        if (user?.role !== 'client') {
            toast.error('Only clients can contact freelancers.');
            return;
        }
        const freelancerId = profile?._id || id;
        if (!freelancerId) {
            toast.error('Unable to identify this freelancer.');
            return;
        }
        setOpeningConversation(true);
        try {
            const response = await createOrGetConversation(freelancerId);
            const conversationId = response?.data?._id;
            if (!response?.success || !conversationId) {
                throw new Error(response?.message || 'Unable to open conversation.');
            }
            navigate(`/client/messages?conversationId=${encodeURIComponent(conversationId)}`);
        } catch (error) {
            toast.error(error.message || 'Unable to open conversation.');
        } finally {
            setOpeningConversation(false);
        }
    };

    const handleSendRequest = async (requestData) => {
        try {
            const res = await createProjectRequest({
                ...requestData,
                freelancerId: id
            });
            if (res.success) {
                toast.success('Project request sent successfully!');
                setIsRequestModalOpen(false);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to send project request');
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getFreelancerProfile(id);
                if (res && res.success) {
                    setProfile(res.data);
                } else {
                    throw new Error('Failed to load profile');
                }
            } catch (error) {
                toast.error(error.message || 'Failed to load profile');
                navigate(-1); // Go back if profile cannot be loaded
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProfile();
        }
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) {
        return null; // Will redirect automatically
    }

    const servicesList = profile.services ? profile.services.split(',').map(s => s.trim()).filter(Boolean) : [];
    const skillsList = profile.skills ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

    return (
        <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
            {/* Header / Back Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-surface-variant rounded-lg transition-colors text-on-surface-variant hover:text-on-surface"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-title-lg font-bold text-on-surface">Freelancer Profile</h1>
                </div>
                {user?.role === 'client' && (
                    <Button variant="primary" onClick={() => setIsRequestModalOpen(true)}>
                        Send Project Request
                    </Button>
                )}
            </div>

            <ProjectRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSubmit={handleSendRequest}
                freelancerName={profile.name}
            />

            {/* Profile Hero Card */}
            <Card className="relative overflow-hidden p-0 border-0 shadow-lg">
                <div className="h-40 bg-gradient-to-r from-primary/20 via-secondary/20 to-tertiary/20 absolute top-0 left-0 right-0"></div>

                <div className="relative pt-24 px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-surface shadow-xl bg-surface-variant shrink-0">
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-display-md font-bold">
                                    {profile.name?.charAt(0) || 'F'}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-2">
                            <h2 className="font-display-sm font-black text-on-surface">{profile.name}</h2>
                            {profile.title && (
                                <p className="text-primary font-title-md font-semibold">{profile.title}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-4 text-body-sm text-on-surface-variant pt-2">
                                {profile.location && (
                                    <div className="flex items-center gap-1.5 bg-surface-variant/50 px-3 py-1 rounded-full">
                                        <MapPin className="w-4 h-4" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.experienceLevel && (
                                    <div className="flex items-center gap-1.5 bg-surface-variant/50 px-3 py-1 rounded-full">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{EXPERIENCE_LABELS[profile.experienceLevel]} · {profile.experienceYears} {profile.experienceYears === 1 ? 'year' : 'years'} experience</span>
                                    </div>
                                )}
                                {profile.availabilityType && (
                                    <div className="flex items-center gap-1.5 bg-surface-variant/50 px-3 py-1 rounded-full">
                                        <Clock className="w-4 h-4" />
                                        <span>{AVAILABILITY_LABELS[profile.availabilityType]} · {profile.availableHoursPerWeek} hours/week</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0 w-full md:w-auto flex justify-center">
                            <Button
                                type="button"
                                className="w-full md:w-auto px-8"
                                size="lg"
                                onClick={handleContactFreelancer}
                                disabled={openingConversation}
                            >
                                {openingConversation ? 'Opening...' : 'Contact Freelancer'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (About & Details) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8">
                        <h3 className="font-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            About Me
                        </h3>
                        {profile.bio ? (
                            <p className="text-body-md text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                                {profile.bio}
                            </p>
                        ) : (
                            <p className="text-body-sm text-on-surface-variant italic">This freelancer hasn't added a bio yet.</p>
                        )}
                    </Card>

                    <Card className="p-8">
                        <h3 className="font-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-secondary" />
                            Services Provided
                        </h3>
                        {servicesList.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {servicesList.map((service, idx) => (
                                    <div key={idx} className="bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-xl font-body-sm font-semibold flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {service}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-body-sm text-on-surface-variant italic">No specific services listed.</p>
                        )}
                    </Card>

                    <Card className="p-8">
                        <h3 className="font-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                            <FolderCheck className="w-5 h-5 text-tertiary" />
                            Completed Projects
                        </h3>
                        {profile.completedProjects?.length > 0 ? (
                            <div className="space-y-4">
                                {profile.completedProjects.map(project => (
                                    <div key={project._id} className="rounded-xl border border-outline-variant/20 bg-surface-container-low/50 p-4">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                            <h4 className="font-title-md font-bold text-on-surface">{project.title}</h4>
                                            <span className="text-body-sm text-on-surface-variant">{new Date(project.completionDate).toLocaleDateString()}</span>
                                        </div>
                                        <p className="mt-1 text-body-sm text-on-surface-variant">{project.category}</p>
                                        {project.description && <p className="mt-3 text-body-sm text-on-surface-variant whitespace-pre-wrap">{project.description}</p>}
                                        {project.skills?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{project.skills.map(skill => <span key={skill} className="rounded-lg bg-surface-variant/50 px-2.5 py-1 text-label-sm text-on-surface">{skill}</span>)}</div>}
                                        <div className="mt-3 flex flex-wrap gap-4 text-body-sm text-on-surface">
                                            <span>Budget: ₹{Number(project.budget || 0).toLocaleString('en-IN')}</span>
                                            {project.clientRating && <span className="flex items-center gap-1 text-primary"><Star className="h-4 w-4 fill-current" />{Number(project.clientRating).toFixed(1)}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-body-sm text-on-surface-variant italic">No completed projects to showcase yet.</p>
                        )}
                    </Card>

                    <Card className="p-8">
                        <h3 className="font-title-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary" />
                            Reviews
                        </h3>
                        {profile.reviews?.length > 0 ? (
                            <div className="space-y-4">
                                {profile.reviews.map(review => (
                                    <div key={review._id} className="rounded-xl border border-outline-variant/20 bg-surface-container-low/50 p-4">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-title-md font-bold text-on-surface">{review.clientName || 'Verified Client'}</p>
                                                <div className="mt-1 flex text-primary">{[1, 2, 3, 4, 5].map(value => <Star key={value} className={`h-4 w-4 ${value <= Math.round(review.rating || 0) ? 'fill-current' : ''}`} />)}</div>
                                            </div>
                                            <span className="text-body-sm text-on-surface-variant">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {review.reviewMessage && <p className="mt-3 text-body-md text-on-surface-variant whitespace-pre-wrap">“{review.reviewMessage}”</p>}
                                        <p className="mt-3 text-body-sm text-on-surface"><span className="text-on-surface-variant">Project:</span> {review.projectName || 'Completed Project'}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-body-sm text-on-surface-variant italic">No reviews yet.</p>
                        )}
                    </Card>
                </div>

                {/* Right Column (Sidebar metrics) */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-title-md font-bold text-on-surface mb-4">Rating</h3>
                        <div className="flex items-center gap-3">
                            <div className="flex text-primary">
                                {[1, 2, 3, 4, 5].map(value => <Star key={value} className={`h-5 w-5 ${value <= Math.round(profile.averageRating || 0) ? 'fill-current' : ''}`} />)}
                            </div>
                            <span className="font-title-md font-bold text-on-surface">{Number(profile.averageRating || 0).toFixed(1)}</span>
                        </div>
                        <p className="mt-3 text-body-sm text-on-surface-variant">Based on {profile.totalReviews || 0} client reviews from completed projects</p>
                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-outline-variant/10 pt-4 text-center">
                            <div><p className="font-title-md font-bold text-on-surface">{profile.totalCompletedProjects || 0}</p><p className="text-label-sm text-on-surface-variant">Completed projects</p></div>
                            <div><p className="font-title-md font-bold text-on-surface">{profile.totalReviews || 0}</p><p className="text-label-sm text-on-surface-variant">Total reviews</p></div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-title-md font-bold text-on-surface mb-4">Skills & Expertise</h3>
                        {skillsList.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {skillsList.map((skill, idx) => (
                                    <span key={idx} className="bg-surface-variant/50 text-on-surface px-3 py-1.5 rounded-lg text-label-sm font-medium border border-outline-variant/30">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-body-sm text-on-surface-variant italic">No skills listed.</p>
                        )}
                    </Card>

                    {profile.portfolio && (
                        <Card className="p-6 overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-colors" onClick={() => window.open(profile.portfolio, '_blank')}>
                            <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-tertiary/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                            <h3 className="font-title-md font-bold text-on-surface mb-2 flex items-center gap-2 relative z-10">
                                <Globe className="w-5 h-5 text-tertiary" />
                                Portfolio
                            </h3>
                            <p className="text-body-sm text-on-surface-variant relative z-10 truncate border-b border-tertiary/20 pb-1 w-fit mt-3 group-hover:text-tertiary transition-colors">
                                {profile.portfolio}
                            </p>
                        </Card>
                    )}

                </div>

            </div>
        </div>
    );
};

export default FreelancerProfile;
