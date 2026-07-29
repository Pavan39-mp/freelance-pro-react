import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Briefcase, Building, ArrowRight, Sparkles } from 'lucide-react';
import Card from '../components/ui/Card';
import { useUser } from '../context/UserContext';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { user, loading } = useUser();

    const chooseRole = (role) => {
        sessionStorage.setItem('freelancepro_selected_role', role);
        navigate(`/login?role=${role}`);
    };

    // If auth is still loading, wait — do not flash the landing page
    if (loading) return null;

    // Already authenticated — send to correct dashboard immediately
    if (user) {
        if (user.role === 'client') return <Navigate to="/client-dashboard" replace />;
        return <Navigate to="/freelancer/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] relative overflow-hidden p-6">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-primary-container)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[var(--color-tertiary-container)] rounded-full blur-[120px] opacity-15 pointer-events-none"></div>

            <div className="w-full max-w-4xl relative z-10 animate-fade-in-up">

                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="bg-[var(--color-surface-container)] p-4 rounded-3xl border border-[var(--color-outline-variant)] shadow-sm">
                            <Sparkles className="h-10 w-10 text-[var(--color-primary)]" />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] mb-4 tracking-tight">
                        Welcome to FreelancePro
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
                        Choose how you want to use the platform. Are you here to manage your freelance business, or hire top-tier talent?
                    </p>
                </div>

                {/* Role Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                    {/* Freelancer Card */}
                    <button
                        onClick={() => chooseRole('freelancer')}
                        className="group text-left h-full transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-container)] rounded-3xl"
                        aria-label="Continue as Freelancer"
                    >
                        <Card className="h-full bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] flex flex-col p-8 md:p-10 shadow-md group-hover:shadow-[var(--color-primary-container)]/30 group-hover:border-[var(--color-primary)] transition-all duration-300">
                            <div className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Briefcase className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-3 group-hover:text-[var(--color-primary)] transition-colors duration-300">
                                Continue as Freelancer
                            </h2>
                            <p className="text-[var(--color-on-surface-variant)] mb-8 flex-grow leading-relaxed">
                                Manage your clients, projects, tasks, and productivity in one place. Streamline your freelance workflow effortlessly.
                            </p>
                            <div className="flex items-center text-[var(--color-primary)] font-semibold mt-auto">
                                <span>Get Started</span>
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                            </div>
                        </Card>
                    </button>

                    {/* Client Card */}
                    <button
                        onClick={() => chooseRole('client')}
                        className="group text-left h-full transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[var(--color-tertiary-container)] rounded-3xl"
                        aria-label="Continue as Client"
                    >
                        <Card className="h-full bg-[var(--color-surface-container)] border-[var(--color-outline-variant)] flex flex-col p-8 md:p-10 shadow-md group-hover:shadow-[var(--color-tertiary-container)]/30 group-hover:border-[var(--color-tertiary)] transition-all duration-300">
                            <div className="bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] h-16 w-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Building className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-3 group-hover:text-[var(--color-tertiary)] transition-colors duration-300">
                                Continue as Client
                            </h2>
                            <p className="text-[var(--color-on-surface-variant)] mb-8 flex-grow leading-relaxed">
                                Discover highly skilled freelancers, manage active projects, and collaborate with top professionals seamlessly.
                            </p>
                            <div className="flex items-center text-[var(--color-tertiary)] font-semibold mt-auto">
                                <span>Get Started</span>
                                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                            </div>
                        </Card>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
