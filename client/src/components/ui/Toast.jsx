import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ANIMATION_DURATION_MS = 300;

const variantConfig = {
  success: {
    container: 'bg-green-50 ring-green-300/60 shadow-green-100',
    icon: 'text-green-600',
    text: 'text-green-800',
    progress: 'bg-green-500',
    role: 'status',
    Icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    ),
  },
  error: {
    container: 'bg-red-50 ring-red-300/60 shadow-red-100',
    icon: 'text-red-600',
    text: 'text-red-800',
    progress: 'bg-red-500',
    role: 'alert',
    Icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    ),
  },
  info: {
    container: 'bg-blue-50 ring-blue-300/60 shadow-blue-100',
    icon: 'text-blue-600',
    text: 'text-blue-800',
    progress: 'bg-blue-500',
    role: 'status',
    Icon: (
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    ),
  },
  warning: {
    container: 'bg-amber-50 ring-amber-300/60 shadow-amber-100',
    icon: 'text-amber-600',
    text: 'text-amber-800',
    progress: 'bg-amber-500',
    role: 'status',
    Icon: (
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    ),
  },
};

const ToastItem = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const cfg = variantConfig[toast.variant] || variantConfig.info;

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(toast.id), ANIMATION_DURATION_MS);
  };

  const animationClass = isLeaving
    ? 'translate-x-full opacity-0'
    : isVisible
      ? 'translate-x-0 opacity-100'
      : 'translate-x-full opacity-0';

  return (
    <div
      className={`pointer-events-auto flex w-80 items-start gap-3 rounded-lg p-4 shadow-lg ring-1 transition-all duration-300 ease-in-out ${cfg.container} ${animationClass}`}
      role={cfg.role}
      aria-live="assertive"
    >
      <svg
        className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.icon}`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        {cfg.Icon}
      </svg>

      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className={`text-sm font-semibold ${cfg.text}`}>{toast.title}</p>
        )}
        <p className={`text-sm ${cfg.text} ${toast.title ? 'mt-0.5' : ''}`}>
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className={`-mr-1 -mt-1 shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1 ${cfg.text}`}
        aria-label="Close notification"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-9999 flex flex-col items-end gap-3 p-6"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body,
  );
};

export default ToastContainer;
