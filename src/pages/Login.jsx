import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Rocket, ArrowRight, Eye, EyeOff, Briefcase, Building } from 'lucide-react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryRole = searchParams.get('role');
  const isValidRole = (role) => role === 'freelancer' || role === 'client';
  const roleType = isValidRole(queryRole)
    ? queryRole
    : (isValidRole(sessionStorage.getItem('freelancepro_selected_role'))
      ? sessionStorage.getItem('freelancepro_selected_role')
      : null);

  const { login, user } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Preserve the chosen role through the login flow, but never send an
  // authenticated user back through role selection.
  useEffect(() => {
    if (!user && !roleType) {
      navigate('/', { replace: true });
    }
  }, [roleType, user, navigate]);

  useEffect(() => {
    if (isValidRole(queryRole)) {
      sessionStorage.setItem('freelancepro_selected_role', queryRole);
    }
  }, [queryRole]);

  // Redirect authenticated users to their correct dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'client') {
        navigate('/client-dashboard');
      } else if (user.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, roleType);
      if (res.success) {
        const actualRole = res.role;
        toast.success('Welcome back!');
        sessionStorage.removeItem('freelancepro_selected_role');
        navigate(actualRole === 'client' ? '/client-dashboard' : '/freelancer/dashboard', { replace: true });
      } else {
        toast.error(res.message || 'Invalid email or password');
      }
    } catch {
      toast.error('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };


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

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Rocket className="text-on-primary w-6 h-6" />
            </div>
            <h1 className="font-headline-md text-headline-sm font-black text-primary tracking-tight">FreelancePro</h1>
          </div>

          <Card className="p-8 md:p-[2.5rem] rounded-[1.875rem] shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-tertiary/5 rounded-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h2 className="font-headline-md text-[1.75rem] font-bold text-on-surface mb-2">
                  {roleType === 'client' ? 'Client Login' : 'Freelancer Login'}
                </h2>
                {/* Read-only role badge */}
                <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/30">
                  {roleType === 'client'
                    ? <Building className="w-3.5 h-3.5 text-on-surface-variant" />
                    : <Briefcase className="w-3.5 h-3.5 text-on-surface-variant" />}
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    {roleType === 'client' ? 'Client Account' : 'Freelancer Account'}
                  </span>
                </div>
                <p className="text-on-surface-variant text-body-sm mt-3">Sign in to continue to your dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={Mail}
                  className="!pl-12 !pr-4"
                  placeholder="alex@example.com"
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-label-caps text-label-caps text-on-surface-variant ml-1" htmlFor="password">Password *</label>
                    <Link to="/forgot-password" className="font-label-caps text-label-caps text-primary hover:underline">Forgot?</Link>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftIcon={Lock}
                    className="!pl-12 !pr-12"
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
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container-high text-primary focus:ring-primary focus:ring-offset-background" />
                  <label htmlFor="remember" className="text-body-sm text-on-surface-variant">Remember me for 30 days</label>
                </div>

                <Button
                  type="submit"
                  className="w-full py-4 flex items-center justify-center gap-2 group"
                  disabled={loading}
                >
                  {loading ? 'Signing In…' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="mt-8 text-center text-body-sm text-on-surface-variant">
                Don't have an account? <Link to={roleType ? `/register?role=${roleType}` : "/register"} className="text-primary hover:underline font-bold">Start for free</Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
