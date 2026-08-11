import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Building, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Card from '../components/ui/Card';
import { useUser } from '../context/UserContext';

const roles = [
    {
        id: 'freelancer',
        title: 'Continue as Freelancer',
        description: 'Run your freelance business from one focused workspace designed for independent professionals.',
        benefits: ['Manage clients', 'Track projects', 'Improve productivity', 'Manage workflow'],
        cta: 'Enter Freelancer Workspace',
        Icon: Briefcase,
        iconClass: 'bg-primary-container text-on-primary-container',
        accentClass: 'group-hover:border-primary',
        focusClass: 'focus-visible:ring-primary-container',
        titleClass: 'group-hover:text-primary',
        ctaClass: 'text-primary bg-primary/10 group-hover:bg-primary/15'
    },
    {
        id: 'client',
        title: 'Continue as Client',
        description: 'Find the right talent and keep every project, milestone, and conversation organized.',
        benefits: ['Find freelancers', 'Manage projects', 'Track progress', 'Collaborate easily'],
        cta: 'Enter Client Workspace',
        Icon: Building,
        iconClass: 'bg-tertiary-container text-on-tertiary-container',
        accentClass: 'group-hover:border-tertiary',
        focusClass: 'focus-visible:ring-tertiary-container',
        titleClass: 'group-hover:text-tertiary',
        ctaClass: 'text-tertiary bg-tertiary/10 group-hover:bg-tertiary/15'
    }
];

const RoleSelection = () => {
    const navigate = useNavigate();
    const { user, loading } = useUser();
    const reduceMotion = useReducedMotion();

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

    const entrance = reduceMotion ? {} : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: 'easeOut' }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-surface px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
            {/* Quiet ambient decoration using existing theme colors. */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary-container/30 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-36 -right-32 h-96 w-96 rounded-full bg-tertiary-container/25 blur-[110px]" />
            <div className="pointer-events-none absolute left-[8%] top-[18%] h-2.5 w-2.5 rounded-full bg-primary/20" />
            <div className="pointer-events-none absolute right-[10%] top-[24%] h-4 w-4 rounded-full border border-tertiary/20" />
            <div className="pointer-events-none absolute bottom-[18%] left-[14%] h-8 w-8 rotate-12 rounded-lg border border-outline-variant/20" />

            <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center">
                <motion.header {...entrance} className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
                    <div className="mb-5 flex justify-center sm:mb-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-outline-variant/30 bg-surface-container shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]">
                            <Sparkles className="h-8 w-8 text-primary sm:h-9 sm:w-9" />
                        </div>
                    </div>
                    <p className="mb-3 font-label-caps text-label-caps font-bold tracking-widest text-primary">Choose your workspace</p>
                    <h1 className="mb-4 font-headline-md text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl">
                        Welcome to FreelancePro
                    </h1>
                    <p className="mx-auto max-w-xl font-body-md text-on-surface-variant sm:text-lg">
                        Select how you want to use the platform. You can continue as an independent professional or as a client building a project team.
                    </p>
                </motion.header>

                <motion.div
                    initial={reduceMotion ? undefined : 'hidden'}
                    animate={reduceMotion ? undefined : 'visible'}
                    variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } } }}
                    className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7"
                >
                    {roles.map(({ id, title, description, benefits, cta, Icon, iconClass, accentClass, focusClass, titleClass, ctaClass }) => (
                        <motion.button
                            key={id}
                            type="button"
                            onClick={() => chooseRole(id)}
                            variants={reduceMotion ? undefined : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } }}
                            whileHover={reduceMotion ? undefined : { y: -6 }}
                            className={`group h-full rounded-3xl text-left outline-none transition-shadow duration-300 hover:shadow-2xl focus-visible:ring-4 ${focusClass}`}
                            aria-label={title}
                        >
                            <Card className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container p-6 shadow-md transition-all duration-300 sm:p-8 lg:p-9 ${accentClass}`}>
                                <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 -translate-y-10 translate-x-10 rounded-full bg-surface-variant/30 transition-transform duration-500 group-hover:scale-125" />

                                <div className={`relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110 ${iconClass}`}>
                                    <Icon className="h-8 w-8" />
                                </div>

                                <h2 className={`mb-3 font-headline-sm text-2xl font-bold text-on-surface transition-colors duration-300 ${titleClass}`}>
                                    {title}
                                </h2>
                                <p className="mb-6 font-body-md leading-relaxed text-on-surface-variant">
                                    {description}
                                </p>

                                <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                                    {benefits.map(benefit => (
                                        <li key={benefit} className="flex min-w-0 items-center gap-2.5 text-body-sm font-medium text-on-surface">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className={`mt-auto flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-4 py-3 font-label-caps text-label-caps font-bold transition-colors duration-300 ${ctaClass}`}>
                                    <span>{cta}</span>
                                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
                                </div>
                            </Card>
                        </motion.button>
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default RoleSelection;
