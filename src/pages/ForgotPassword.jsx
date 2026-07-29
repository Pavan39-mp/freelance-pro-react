import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { forgotPassword } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      const response = await forgotPassword(email);
      if (response.success) setMessage(response.message);
      else setError(response.message || 'Unable to request a password reset.');
    } catch (requestError) {
      setError(requestError?.message || 'Unable to request a password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 md:p-10 rounded-[1.875rem] shadow-2xl">
        <h1 className="font-headline-md text-[1.75rem] font-bold text-on-surface mb-2">Reset your password</h1>
        <p className="text-body-sm text-on-surface-variant mb-8">Enter your account email and we’ll send a secure reset link.</p>
        {message && <p className="mb-5 p-3 rounded-xl bg-tertiary/10 text-tertiary text-body-sm">{message}</p>}
        {error && <p className="mb-5 p-3 rounded-xl bg-error/10 text-error text-body-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input type="email" label="Email Address" value={email} onChange={(event) => setEmail(event.target.value)} leftIcon={Mail} required />
          <Button type="submit" className="w-full py-3" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset link'}</Button>
        </form>
        <Link to="/" className="block text-center mt-6 text-body-sm text-primary hover:underline">Back to sign in</Link>
      </Card>
    </div>
  );
};

export default ForgotPassword;
