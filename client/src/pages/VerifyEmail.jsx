import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';

const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState(STATUS.LOADING);
  const [errorMessage, setErrorMessage] = useState('');
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const verifyToken = async () => {
      try {
        await api.get(`/api/auth/verify/${token}`);
        setStatus(STATUS.SUCCESS);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || 'Verification link is invalid or has expired.'
        );
        setStatus(STATUS.ERROR);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200/60">
        {/* Loading State */}
        {status === STATUS.LOADING && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email</h2>
            <p className="mt-3 text-gray-600">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {/* Success State */}
        {status === STATUS.SUCCESS && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email verified!</h2>
            <p className="mt-3 text-gray-600">
              Your email address has been successfully verified. You can now sign in to your account.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Sign in
            </Link>
          </>
        )}

        {/* Error State */}
        {status === STATUS.ERROR && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verification failed</h2>
            <p className="mt-3 text-gray-600">{errorMessage}</p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                to="/register"
                className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Register again
              </Link>
              <Link
                to="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
