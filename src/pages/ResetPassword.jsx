import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => navigate('/', { replace: true }), 1500);
    return () => window.clearTimeout(timeout);
  }, [message, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!token) return setError('This password reset link is invalid or incomplete.');
    if (password !== confirmation) return setError('Passwords do not match.');
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return setError('Password must include uppercase, lowercase, number, and special character.');
    }
    setSubmitting(true);
    try {
      const response = await resetPassword(token, password, confirmation);
      if (response.success) setMessage('Password reset successfully. You can now sign in.');
      else setError(response.message || 'Unable to reset password.');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 md:p-10 rounded-[1.875rem] shadow-2xl">
        <h1 className="font-headline-md text-[1.75rem] font-bold text-on-surface mb-2">Choose a new password</h1>
        <p className="text-body-sm text-on-surface-variant mb-8">Use at least 8 characters with uppercase, lowercase, number, and special character.</p>
        {message && <p className="mb-5 p-3 rounded-xl bg-tertiary/10 text-tertiary text-body-sm">{message}</p>}
        {error && <p className="mb-5 p-3 rounded-xl bg-error/10 text-error text-body-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="New Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            leftIcon={Lock}
            rightIcon={<button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="w-5 h-5 text-text-secondary" /> : <Eye className="w-5 h-5 text-text-secondary" />}</button>}
            required
          />
          <Input
            type={showConfirmation ? 'text' : 'password'}
            label="Confirm Password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            leftIcon={Lock}
            rightIcon={<button type="button" onClick={() => setShowConfirmation((current) => !current)} aria-label={showConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}>{showConfirmation ? <EyeOff className="w-5 h-5 text-text-secondary" /> : <Eye className="w-5 h-5 text-text-secondary" />}</button>}
            required
          />
          <Button type="submit" className="w-full py-3" disabled={submitting}>{submitting ? 'Resetting…' : 'Reset password'}</Button>
        </form>
        <Link to="/" className="block text-center mt-6 text-body-sm text-primary hover:underline">Back to sign in</Link>
      </Card>
    </div>
  );
};

export default ResetPassword;
