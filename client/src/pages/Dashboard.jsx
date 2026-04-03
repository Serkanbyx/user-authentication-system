import { useState, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import { PASSWORD_RULES, getPasswordStrength } from '../utils/passwordValidation';

const INPUT_BASE = 'mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset';

const SuccessAlert = ({ message }) => (
  <div className="mb-6 flex items-start gap-3 rounded-lg bg-green-50 p-4 ring-1 ring-green-200/60" role="status">
    <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-green-700">{message}</p>
  </div>
);

const ErrorAlert = ({ message }) => (
  <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 ring-1 ring-red-200/60" role="alert">
    <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
    <p className="text-sm text-red-700">{message}</p>
  </div>
);

const Dashboard = () => {
  const { user, setUser } = useAuth();

  // --- Edit Profile State ---
  const [profileData, setProfileData] = useState({ name: user?.name || '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileServerError, setProfileServerError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // --- Change Password State ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordServerError, setPasswordServerError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  const newPasswordStrength = getPasswordStrength(passwordData.newPassword);

  // --- Profile Handlers ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors((prev) => ({ ...prev, [name]: '' }));
    if (profileServerError) setProfileServerError('');
    if (profileSuccess) setProfileSuccess('');
  };

  const validateProfile = useCallback(() => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (profileData.name.trim().length > 50) {
      newErrors.name = 'Name cannot exceed 50 characters';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profileData]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setIsProfileSubmitting(true);
    setProfileServerError('');
    setProfileSuccess('');

    try {
      const { data } = await api.put('/api/users/profile', {
        name: profileData.name.trim(),
      });

      setUser(data.user);
      setProfileSuccess(data.message);
    } catch (err) {
      const res = err.response?.data;

      if (res?.errors?.length) {
        const fieldErrors = {};
        res.errors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setProfileErrors(fieldErrors);
      } else {
        setProfileServerError(res?.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  // --- Password Handlers ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors((prev) => ({ ...prev, [name]: '' }));
    if (passwordServerError) setPasswordServerError('');
    if (passwordSuccess) setPasswordSuccess('');
  };

  const validatePassword = useCallback(() => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const failedRules = PASSWORD_RULES.filter((r) => !r.test(passwordData.newPassword));
      if (failedRules.length > 0) {
        newErrors.newPassword = failedRules[0].label;
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passwordData]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setIsPasswordSubmitting(true);
    setPasswordServerError('');
    setPasswordSuccess('');

    try {
      const { data } = await api.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess(data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const res = err.response?.data;

      if (res?.errors?.length) {
        const fieldErrors = {};
        res.errors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setPasswordErrors(fieldErrors);
      } else {
        setPasswordServerError(res?.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const inputClasses = (hasError) =>
    `${INPUT_BASE} ${hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-600'}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1.5 text-sm text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-600">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="truncate text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="mt-5 flex items-center gap-2">
          {user?.isVerified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
              Email verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Email not verified
            </span>
          )}
        </div>
      </div>

      {/* Edit Profile Card */}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
        <p className="mt-1 text-sm text-gray-500">Update your personal information.</p>

        <div className="mt-6">
          {profileSuccess && <SuccessAlert message={profileSuccess} />}
          {profileServerError && <ErrorAlert message={profileServerError} />}

          <form onSubmit={handleProfileSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="profile-name"
                name="name"
                type="text"
                autoComplete="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className={inputClasses(profileErrors.name)}
                placeholder="John Doe"
              />
              {profileErrors.name && (
                <p className="mt-1.5 text-sm text-red-600">{profileErrors.name}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isProfileSubmitting}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isProfileSubmitting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {isProfileSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <p className="mt-1 text-sm text-gray-500">
          Ensure your account stays secure by using a strong password.
        </p>

        <div className="mt-6">
          {passwordSuccess && <SuccessAlert message={passwordSuccess} />}
          {passwordServerError && <ErrorAlert message={passwordServerError} />}

          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={inputClasses(passwordErrors.currentPassword)}
                placeholder="••••••••"
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1.5 text-sm text-red-600">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={inputClasses(passwordErrors.newPassword)}
                placeholder="••••••••"
              />
              {passwordErrors.newPassword && (
                <p className="mt-1.5 text-sm text-red-600">{passwordErrors.newPassword}</p>
              )}

              {/* Password Strength Indicator */}
              {passwordData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium ${
                      newPasswordStrength.level <= 1 ? 'text-red-600' :
                      newPasswordStrength.level === 2 ? 'text-orange-600' :
                      newPasswordStrength.level === 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {newPasswordStrength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < newPasswordStrength.level ? newPasswordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="mt-2.5 space-y-1">
                    {PASSWORD_RULES.map((rule) => {
                      const passed = rule.test(passwordData.newPassword);
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
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={inputClasses(passwordErrors.confirmPassword)}
                placeholder="••••••••"
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPasswordSubmitting}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isPasswordSubmitting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                {isPasswordSubmitting ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
