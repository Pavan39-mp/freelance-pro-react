import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Check, X, Rocket, ArrowRight, ShieldCheck, Briefcase, Building } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useUser();

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [searchParams] = useSearchParams();
    const queryRole = searchParams.get('role');
    // Role is locked to the selection made on the Role Selection page — not changeable here
    const storedRole = sessionStorage.getItem('freelancepro_selected_role');
    const role = (queryRole === 'client' || queryRole === 'freelancer')
        ? queryRole
        : ((storedRole === 'client' || storedRole === 'freelancer') ? storedRole : null);

    // Guard: redirect to Role Selection if no valid role in URL
    useEffect(() => {
        if (!role) {
            navigate('/', { replace: true });
        }
    }, [role, navigate]);

    // Interactive UI states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Real-time password requirement flags
    const [requirements, setRequirements] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
    });

    // Calculate password strength rating (0 to 5)
    const [strength, setStrength] = useState(0);

    // Monitor password changes to evaluate requirements and strength
    useEffect(() => {
        const checks = {
            minLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[^A-Za-z0-9]/.test(password),
        };

        setRequirements(checks);

        // Score based on checked criteria
        const score = Object.values(checks).filter(Boolean).length;
        setStrength(score);
    }, [password]);

    // Client-side validations
    const validateForm = () => {
        if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
            setErrorMessage('Please enter your full name (first and last name).');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('Please enter a valid email address.');
            return false;
        }

        // Verify all password requirements are met
        const allRequirementsMet = Object.values(requirements).every(Boolean);
        if (!allRequirementsMet) {
            setErrorMessage('Password does not meet all security requirements.');
            return false;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return false;
        }

        setErrorMessage('');
        return true;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Reset alert states
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const res = await register(fullName, email, password, role);

            if (res.success) {
                setSuccessMessage('Registration successful! Redirecting to login screen...');
                setTimeout(() => {
                    navigate(`/login?role=${role}`);
                }, 2000);
            } else {
                setErrorMessage(res.message || 'Registration failed. Email might already be in use.');
            }
        } catch (err) {
            setErrorMessage(err.message || 'An error occurred during registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Visual text for password strength
    const getStrengthLabel = () => {
        switch (strength) {
            case 0:
            case 1:
                return { text: 'Weak', class: 'bg-error', textClass: 'text-error' };
            case 2:
            case 3:
                return { text: 'Fair', class: 'bg-tertiary', textClass: 'text-tertiary' };
            case 4:
                return { text: 'Good', class: 'bg-primary-fixed-dim', textClass: 'text-primary-fixed-dim' };
            case 5:
                return { text: 'Strong', class: 'bg-success-color', textClass: 'text-success' }; // Note: we'll use inline style or standard color variables
            default:
                return { text: 'Weak', class: 'bg-outline', textClass: 'text-outline' };
        }
    };

    const strengthStyle = getStrengthLabel();

    // Custom inline success color matching professional CSS
    const successColor = 'rgba(74, 222, 128, 1)'; // Bright green for success
    const successBg = 'rgba(74, 222, 128, 0.1)';

    return (
        <div className="min-h-screen bg-background text-on-background font-body-md flex overflow-hidden">
            {/* Left Panel - Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-low flex-col justify-between p-12 border-r border-outline-variant/10">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/20 blur-[7.5rem] rounded-full mix-blend-screen"></div>
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-tertiary/20 blur-[7.5rem] rounded-full mix-blend-screen"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Rocket className="text-on-primary w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-headline-md text-headline-sm font-black text-primary tracking-tight">FreelancePro</h1>
                        <p className="font-label-caps text-label-caps text-on-surface-variant opacity-70">Creative Labs</p>
                    </div>
                </div>

                <div className="relative z-10 max-w-md">
                    <h2 className="font-display-lg text-[2.5rem] leading-tight font-bold text-on-surface mb-6">
                        Elevate your freelance workflow.
                    </h2>
                    <p className="text-on-surface-variant text-body-lg mb-8">
                        Manage clients, track projects, and analyze your productivity with AI-driven insights in one powerful dashboard.
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} alt={`User ${i}`} className="w-10 h-10 rounded-full border-2 border-surface-container-low" />
                            ))}
                        </div>
                        <div className="text-sm text-on-surface-variant">
                            <span className="text-on-surface font-bold">2,000+</span> freelancers joined this month
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Panel - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-y-auto max-h-screen">
                <div className="w-full max-w-md py-8">
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Rocket className="text-on-primary w-6 h-6" />
                        </div>
                        <h1 className="font-headline-md text-headline-sm font-black text-primary tracking-tight">FreelancePro</h1>
                    </div>

                    <Card className="p-6 md:p-[2.5rem] rounded-[1.875rem] shadow-2xl relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="text-center mb-8">
                                <h2 className="font-headline-md text-[1.75rem] font-bold text-on-surface mb-2">Create Account</h2>
                                {/* Read-only locked role indicator */}
                                <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30">
                                    {role === 'client'
                                        ? <Building className="w-3.5 h-3.5 text-on-surface-variant" />
                                        : <Briefcase className="w-3.5 h-3.5 text-on-surface-variant" />}
                                    <span className="font-label-caps text-label-caps text-on-surface-variant">
                                        {role === 'client' ? 'Creating a Client Account' : 'Creating a Freelancer Account'}
                                    </span>
                                </div>
                                <p className="text-on-surface-variant text-body-sm mt-3">Get started with your free account today</p>
                            </div>

                            {/* Success / Error Message Alerts */}
                            {errorMessage && (
                                <div className="mb-6 p-4 rounded-xl border border-error/20 bg-error-container/20 flex gap-3 text-error text-body-sm items-start">
                                    <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold">Error:</span> {errorMessage}
                                    </div>
                                </div>
                            )}

                            {successMessage && (
                                <div style={{ borderColor: successColor, backgroundColor: successBg, color: successColor }} className="mb-6 p-4 rounded-xl border flex gap-3 text-body-sm items-start">
                                    <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold">Success:</span> {successMessage}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-4">
                                {/* Full Name */}
                                <Input
                                    id="fullName"
                                    type="text"
                                    label="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    leftIcon={User}
                                    placeholder="Alex Mercer"
                                />



                                {/* Email Address */}
                                <Input
                                    id="email"
                                    type="email"
                                    label="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    leftIcon={Mail}
                                    placeholder="alex@example.com"
                                />

                                {/* Password Input */}
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    leftIcon={Lock}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    }
                                    placeholder="Enter password"
                                />

                                {/* Password Strength Indicator details */}
                                {password.length > 0 && (
                                    <div className="space-y-2 p-3 bg-surface-container/30 rounded-xl border border-outline-variant/10">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-on-surface-variant">Password Strength:</span>
                                            <span className={`font-bold ${strengthStyle.textClass}`} style={{ color: strength === 5 ? successColor : undefined }}>
                                                {strengthStyle.text}
                                            </span>
                                        </div>
                                        {/* Visual strength bar */}
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${level <= strength
                                                        ? (strength === 5 ? 'bg-success-bar' : strengthStyle.class)
                                                        : 'bg-outline-variant/20'
                                                        }`}
                                                    style={{
                                                        backgroundColor: level <= strength && strength === 5 ? successColor : undefined
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        {/* Requirements checklist */}
                                        <div className="pt-1.5 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-1 text-[0.6875rem] text-on-surface-variant">
                                            <div className="flex items-center gap-1.5">
                                                {requirements.minLength ? <Check className="w-3.5 h-3.5 text-success" style={{ color: successColor }} /> : <X className="w-3.5 h-3.5 text-error" />}
                                                <span>At least 8 characters</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {requirements.hasUpper ? <Check className="w-3.5 h-3.5 text-success" style={{ color: successColor }} /> : <X className="w-3.5 h-3.5 text-error" />}
                                                <span>One uppercase letter</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {requirements.hasLower ? <Check className="w-3.5 h-3.5 text-success" style={{ color: successColor }} /> : <X className="w-3.5 h-3.5 text-error" />}
                                                <span>One lowercase letter</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {requirements.hasNumber ? <Check className="w-3.5 h-3.5 text-success" style={{ color: successColor }} /> : <X className="w-3.5 h-3.5 text-error" />}
                                                <span>One number (0-9)</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 md:col-span-2">
                                                {requirements.hasSpecial ? <Check className="w-3.5 h-3.5 text-success" style={{ color: successColor }} /> : <X className="w-3.5 h-3.5 text-error" />}
                                                <span>One special character (e.g. !, @, #, etc.)</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        label="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        leftIcon={Lock}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        }
                                        placeholder="Confirm password"
                                    />
                                    {/* Matching Indicator details */}
                                    {confirmPassword.length > 0 && (
                                        <div className="flex items-center gap-1.5 ml-1 mt-1 text-xs">
                                            {password === confirmPassword ? (
                                                <>
                                                    <Check className="w-4 h-4" style={{ color: successColor }} />
                                                    <span style={{ color: successColor }}>Passwords match</span>
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-4 h-4 text-error" />
                                                    <span className="text-error">Passwords do not match</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full flex items-center justify-center gap-2 group ${loading ? 'opacity-85 pointer-events-none' : ''}`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                                <span>Registering...</span>
                                            </div>
                                        ) : (
                                            <>
                                                Sign Up
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center text-body-sm text-on-surface-variant">
                                Already have an account? <Link to={queryRole ? `/login?role=${queryRole}` : "/login"} className="text-primary hover:underline font-bold">Sign In</Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div >
    );
};

export default Register;
