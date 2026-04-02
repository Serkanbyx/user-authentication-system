import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = useCallback(() => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please provide a valid email');
      return false;
    }
    setError('');
    return true;
  }, [email]);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await api.post('/api/auth/forgot-password', { email: email.trim() });
    } catch {
      // Intentionally swallowed — always show the same generic message
      // to prevent email enumeration attacks
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200/60">
          {isSubmitted ? (
            /* Success State */
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M2.106 6.447A2 2 0 001 8.237V16a2 2 0 002 2h14a2 2 0 002-2V8.236a2 2 0 00-1.106-1.789l-7-3.5a2 2 0 00-1.788 0l-7 3.5zm1.48 4.007a.75.75 0 00-.671 1.342l5.855 2.927a2.75 2.75 0 002.46 0l5.852-2.927a.75.75 0 10-.67-1.341l-5.853 2.926a1.25 1.25 0 01-1.118 0l-5.856-2.927z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Check your email</h2>
                <p className="mt-1 text-sm text-gray-600">
                  If an account with that email exists, we&apos;ve sent a password reset link.
                  Please check your inbox and spam folder.
                </p>
              </div>
              <Link
                to="/login"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
                </svg>
                Back to login
              </Link>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                  className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${
                    error
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-indigo-600'
                  }`}
                  placeholder="you@example.com"
                />
                {error && (
                  <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isSubmitting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {isSubmitting ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
