import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /\d/.test(v) },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password) => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return { level: 0, label: '', color: '' };
  if (passed <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (passed <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
  if (passed <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
  return { level: 4, label: 'Strong', color: 'bg-green-500' };
};

const Register = () => {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const failedRules = PASSWORD_RULES.filter((r) => !r.test(formData.password));
      if (failedRules.length > 0) {
        newErrors.password = failedRules[0].label;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      setIsSuccess(true);
    } catch (err) {
      const res = err.response?.data;

      if (res?.errors?.length) {
        const fieldErrors = {};
        res.errors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(res?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200/60">
          {/* Mail icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-3 text-gray-600">
            We&apos;ve sent a verification link to{' '}
            <span className="font-medium text-gray-900">{formData.email}</span>.
            Please check your inbox and click the link to activate your account.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Didn&apos;t receive the email? Check your spam folder.
          </p>

          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Form Card */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200/60">
          {/* Server Error */}
          {serverError && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 ring-1 ring-red-200/60" role="alert">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-600'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${
                  errors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-600'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${
                  errors.password
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-600'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
              )}

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level <= 1 ? 'text-red-600' :
                      passwordStrength.level === 2 ? 'text-orange-600' :
                      passwordStrength.level === 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="mt-2.5 space-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(formData.password);
                      return (
                        <li key={rule.key} className="flex items-center gap-2 text-xs">
                          {passed ? (
                            <svg className="h-3.5 w-3.5 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-3.5 w-3.5 text-gray-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className={passed ? 'text-green-700' : 'text-gray-500'}>
                            {rule.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset ${
                  errors.confirmPassword
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-indigo-600'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isSubmitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer link (mobile-friendly) */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
