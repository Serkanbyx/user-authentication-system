import { useState, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import api from '../api/axios';
import { PASSWORD_RULES } from '../utils/passwordValidation';
import { Alert, Button, Card, Input, PasswordStrengthIndicator } from '../components/ui';


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
      <Card className="sm:p-8">
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
      </Card>

      {/* Edit Profile Card */}
      <Card className="mt-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
        <p className="mt-1 text-sm text-gray-500">Update your personal information.</p>

        <div className="mt-6">
          {profileSuccess ? <Alert variant="success">{profileSuccess}</Alert> : null}
          {profileServerError ? <Alert variant="error">{profileServerError}</Alert> : null}

          <form onSubmit={handleProfileSubmit} noValidate className="space-y-5">
            <Input
              id="profile-name"
              name="name"
              type="text"
              label="Full Name"
              autoComplete="name"
              value={profileData.name}
              onChange={handleProfileChange}
              error={profileErrors.name}
              placeholder="John Doe"
            />

            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={isProfileSubmitting}>
                {isProfileSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card className="mt-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        <p className="mt-1 text-sm text-gray-500">
          Ensure your account stays secure by using a strong password.
        </p>

        <div className="mt-6">
          {passwordSuccess ? <Alert variant="success">{passwordSuccess}</Alert> : null}
          {passwordServerError ? <Alert variant="error">{passwordServerError}</Alert> : null}

          <form onSubmit={handlePasswordSubmit} noValidate className="space-y-5">
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              label="Current Password"
              autoComplete="current-password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
              placeholder="••••••••"
            />

            <div>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                label="New Password"
                autoComplete="new-password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                error={passwordErrors.newPassword}
                placeholder="••••••••"
              />
              <PasswordStrengthIndicator password={passwordData.newPassword} />
            </div>

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm New Password"
              autoComplete="new-password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              placeholder="••••••••"
            />

            <div className="flex justify-end">
              <Button type="submit" variant="primary" loading={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
