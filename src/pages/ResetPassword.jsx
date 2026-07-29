import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { resetPassword } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!token) return setError('This password reset link is invalid or incomplete.');
    if (password !== confirmation) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const response = await resetPassword(token, password);
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
          <Input type="password" label="New Password" value={password} onChange={(event) => setPassword(event.target.value)} leftIcon={Lock} required />
          <Input type="password" label="Confirm Password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} leftIcon={Lock} required />
          <Button type="submit" className="w-full py-3" disabled={submitting}>{submitting ? 'Resetting…' : 'Reset password'}</Button>
        </form>
        <Link to="/" className="block text-center mt-6 text-body-sm text-primary hover:underline">Back to sign in</Link>
      </Card>
    </div>
  );
};

export default ResetPassword;
