import React from 'react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Users, FileText, Briefcase, Clock, ArrowRight, Activity, Search, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UpcomingMeetingsWidget from '../components/dashboard/UpcomingMeetingsWidget';

const ClientDashboard = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Welcome Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-headline-md text-headline-sm font-black text-on-surface tracking-tight mb-2">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Client'}!
                    </h1>
                    <p className="text-on-surface-variant font-body-md max-w-2xl">
                        Here is an overview of your active projects and requests.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate('/client/create-project-request')} className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        <span>Create Project Request</span>
                    </Button>
                    <Button onClick={() => navigate('/client/find-freelancers')} className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        <span>Find Talent</span>
                    </Button>
                </div>
            </header>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-300 group"
                    onClick={() => navigate('/client/find-freelancers')}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-title-md font-bold text-on-surface">Discover</h3>
                            <p className="text-body-sm text-on-surface-variant">Find freelancers</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                </Card>

                <Card
                    className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-300 group"
                    onClick={() => navigate('/client/projects')}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-title-md font-bold text-on-surface">Projects</h3>
                            <p className="text-body-sm text-on-surface-variant">Manage ongoing work</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto text-on-surface-variant group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                    </div>
                </Card>

                <Card
                    className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-300 group"
                    onClick={() => navigate('/client/project-requests')}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-title-md font-bold text-on-surface">Requests</h3>
                            <p className="text-body-sm text-on-surface-variant">View pending inquiries</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto text-on-surface-variant group-hover:text-tertiary group-hover:translate-x-1 transition-all" />
                    </div>
                </Card>
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Active Projects & Requests (Takes 2 columns) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden flex flex-col h-[400px]">
                        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                <h3 className="font-title-md font-bold text-on-surface">Active Projects</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/client/projects')}>View All</Button>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4">
                                <Activity className="w-8 h-8 text-on-surface-variant opacity-50" />
                            </div>
                            <h4 className="font-title-md font-bold text-on-surface mb-2">No Active Projects</h4>
                            <p className="text-body-sm text-on-surface-variant max-w-sm mb-6">
                                You don't have any ongoing projects right now. Discover freelancers and send inquiries to get started.
                            </p>
                            <Button onClick={() => navigate('/client/find-freelancers')}>Discover Freelancers</Button>
                        </div>
                    </Card>

                    <Card className="p-0 overflow-hidden flex flex-col min-h-[300px]">
                        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-secondary" />
                                <h3 className="font-title-md font-bold text-on-surface">Pending Requests</h3>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-body-sm text-on-surface-variant italic">No pending requests at the moment.</p>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Column (Takes 1 column) */}
                <div className="space-y-6">
                    <UpcomingMeetingsWidget onViewMeeting={(meeting) => navigate(`/client/meetings?meetingId=${meeting._id || meeting.id}`)} />
                    <Card className="p-0 overflow-hidden h-[400px] flex flex-col">
                        <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-tertiary" />
                                <h3 className="font-title-md font-bold text-on-surface">Recent Activity</h3>
                            </div>
                        </div>
                        <div className="flex-1 p-6 relative overflow-y-auto">
                            <div className="absolute left-8 top-6 bottom-6 w-px bg-outline-variant/20"></div>
                            <div className="space-y-6 relative z-10">
                                {/* Example Placeholder Activity */}
                                <div className="flex gap-4">
                                    <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary mt-1 relative z-10 shrink-0"></div>
                                    <div>
                                        <p className="text-body-sm text-on-surface font-medium">Account Created</p>
                                        <p className="text-label-sm text-on-surface-variant">Welcome to FreelancePro Client Portal</p>
                                        <span className="text-label-sm text-on-surface-variant opacity-60 mt-1 block">Just now</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 flex flex-col items-center text-center bg-primary-container border-primary/20">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary mb-4 p-1">
                            <div className="w-full h-full rounded-full bg-surface-variant overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold text-xl">
                                        {user?.fullName?.charAt(0) || 'C'}
                                    </div>
                                )}
                            </div>
                        </div>
                        <h3 className="font-title-md font-bold text-on-primary-container">{user?.fullName || 'Client User'}</h3>
                        <p className="text-body-sm text-on-primary-container/80 mb-4">{user?.company || 'Independent Client'}</p>
                        <Button variant="outline" size="sm" onClick={() => navigate('/client/profile')} className="w-full bg-surface/50 border-primary/20 text-on-primary-container hover:bg-surface">
                            Complete Profile
                        </Button>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default ClientDashboard;
