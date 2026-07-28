import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, MapPin, Briefcase, Clock, Filter, X } from 'lucide-react';
import { getFreelancers } from '../../services/freelancerService';
import toast from 'react-hot-toast';

const FindFreelancers = () => {
    const navigate = useNavigate();
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination & Query State
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({
        skills: '',
        availability: '',
        experience: ''
    });
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Mobile filter toggle
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch freelancers whenever query params change
    useEffect(() => {
        fetchFreelancers();
    }, [debouncedSearch, filters, sort, page]);

    const fetchFreelancers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                search: debouncedSearch,
                sort,
                page,
                limit: 12,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
            };
            const res = await getFreelancers(params);
            if (res && res.success) {
                setFreelancers(res.data);
                setTotalPages(res.totalPages || 1);
            } else {
                throw new Error('Failed to load freelancers');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while loading freelancers. Please try again.');
            toast.error('Failed to load freelancers');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to page 1 on filter
    };

    const clearFilters = () => {
        setFilters({ skills: '', availability: '', experience: '' });
        setSearch('');
        setSort('newest');
        setPage(1);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="font-headline-md text-3xl font-bold text-on-surface tracking-tight">Find Freelancers</h1>
                    <p className="text-on-surface-variant text-body-lg mt-2">Discover world-class talent tailored to your project needs.</p>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-on-surface-variant" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-11 pr-4 py-3 bg-surface-container rounded-2xl border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Search by name, skills, or services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                    className="lg:hidden flex items-center justify-center gap-2 py-3 px-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-on-surface font-medium"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="w-5 h-5" />
                    Filters
                </button>

                {/* Filters Group (hidden on mobile unless toggled) */}
                <div className={`flex flex-col lg:flex-row gap-4 ${showFilters ? 'flex' : 'hidden lg:flex'}`}>
                    <select
                        className="py-3 px-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10 relative cursor-pointer"
                        value={filters.availability}
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundPosition: 'calc(100% - 12px) center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                    >
                        <option value="">Any Availability</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Hourly">Hourly</option>
                        <option value="As Needed">As Needed</option>
                    </select>

                    <select
                        className="py-3 px-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10 cursor-pointer"
                        value={filters.experience}
                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundPosition: 'calc(100% - 12px) center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                    >
                        <option value="">Any Experience</option>
                        <option value="Entry Level">Entry Level</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                    </select>

                    <select
                        className="py-3 px-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10 cursor-pointer font-medium text-primary"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%232e6b36" viewBox="0 0 24 24" stroke="%232e6b36" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>')`, backgroundPosition: 'calc(100% - 12px) center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
                    >
                        <option value="newest">Sort: Newest</option>
                        <option value="experience">Sort: Experience</option>
                        <option value="name">Sort: Name (A-Z)</option>
                    </select>

                    {(search || Object.values(filters).some(v => v !== '')) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center justify-center p-3 bg-error/10 text-error rounded-2xl hover:bg-error/20 transition-colors"
                            aria-label="Clear filters"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Rendering */}
            {error ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-surface-container-low rounded-3xl border border-outline-variant/20">
                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4">
                        <X className="w-8 h-8 text-error" />
                    </div>
                    <h2 className="text-xl font-bold text-on-surface mb-2">Oops! Something went wrong</h2>
                    <p className="text-on-surface-variant max-w-md">{error}</p>
                    <button
                        onClick={fetchFreelancers}
                        className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-full hover:bg-primary/90 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            ) : loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="animate-pulse bg-surface-container rounded-3xl p-6 border border-outline-variant/20">
                            <div className="flex gap-4 items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-surface-variant"></div>
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                                    <div className="h-3 bg-surface-variant rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-3 bg-surface-variant rounded w-full"></div>
                                <div className="h-3 bg-surface-variant rounded w-5/6"></div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex justify-between gap-2">
                                <div className="h-4 bg-surface-variant rounded w-16"></div>
                                <div className="h-4 bg-surface-variant rounded w-20"></div>
                            </div>
                            <div className="mt-6 h-11 rounded-xl bg-surface-variant w-full"></div>
                        </div>
                    ))}
                </div>
            ) : freelancers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-surface-container-low rounded-3xl border border-outline-variant/20">
                    <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-secondary" />
                    </div>
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface mb-3">No Freelancers Found</h2>
                    <p className="text-on-surface-variant text-body-sm max-w-md mb-8 leading-relaxed">
                        We couldn't find any freelancers matching your current search and filter criteria. Try adjusting your filters or search terms.
                    </p>
                    <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-surface-variant text-on-surface rounded-full hover:bg-surface-variant/80 transition-colors font-medium"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {freelancers.map(freelancer => {
                            const skillsArray = freelancer.skills ? typeof freelancer.skills === 'string' ? freelancer.skills.split(',').map(s => s.trim()).filter(Boolean) : freelancer.skills : [];
                            return (
                                <div key={freelancer._id || freelancer.id} className="group bg-surface-container-low rounded-3xl p-6 border border-outline-variant/20 hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                                    <div>
                                        <div className="flex gap-4 items-start mb-4">
                                            <img
                                                src={freelancer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.fullName || 'F')}&background=random`}
                                                alt={freelancer.fullName}
                                                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base text-on-surface truncate pr-2 group-hover:text-primary transition-colors">
                                                    {freelancer.fullName}
                                                </h3>
                                                <p className="text-secondary text-xs font-semibold truncate mt-0.5">{freelancer.title || 'Freelance Professional'}</p>

                                                <div className="flex items-center gap-1.5 mt-2 text-on-surface-variant text-xs">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="truncate">{freelancer.location || 'Remote'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-on-surface-variant text-sm line-clamp-2 mb-5 leading-relaxed min-h-[40px]">
                                            {freelancer.bio || 'Experienced professional offering high-quality freelance services.'}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-6 min-h-[28px]">
                                            {skillsArray.slice(0, 3).map((skill, idx) => (
                                                <span key={idx} className="px-2.5 py-1 bg-surface-variant/50 text-on-surface rounded-lg text-[11px] font-medium border border-outline-variant/20 whitespace-nowrap">
                                                    {skill}
                                                </span>
                                            ))}
                                            {skillsArray.length > 3 && (
                                                <span className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant rounded-lg text-[11px] font-medium border border-outline-variant/20">
                                                    +{skillsArray.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-y-3 text-xs mb-5">
                                            <div className="flex items-center gap-2 text-on-surface-variant">
                                                <Briefcase className="w-3.5 h-3.5 text-tertiary" />
                                                <span className="truncate">{freelancer.experience || 'Intermediate'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-on-surface-variant">
                                                <Clock className="w-3.5 h-3.5 text-secondary" />
                                                <span className="truncate">{freelancer.availability || 'Available'}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/client/freelancer/${freelancer._id || freelancer.id}`)}
                                            className="w-full py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm tracking-wide group-hover:bg-primary group-hover:text-on-primary transition-colors"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-12 bg-surface-container py-2 px-4 rounded-full w-fit mx-auto border border-outline-variant/20 shadow-sm">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-variant text-on-surface disabled:opacity-30 hover:bg-primary/20 hover:text-primary transition-colors"
                            >
                                &larr;
                            </button>
                            <div className="flex items-center gap-1 px-2">
                                <span className="text-on-surface font-medium text-sm">Page {page} of {totalPages}</span>
                            </div>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-variant text-on-surface disabled:opacity-30 hover:bg-primary/20 hover:text-primary transition-colors"
                            >
                                &rarr;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FindFreelancers;
