import { createContext, useState, useCallback, useMemo } from 'react';
import ToastContainer from '../components/ui/Toast';

export const ToastContext = createContext(null);

let toastIdCounter = 0;

const AUTO_DISMISS_MS = 5000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (variant, message, options = {}) => {
      const id = ++toastIdCounter;
      const duration = options.duration ?? AUTO_DISMISS_MS;

      setToasts((prev) => [...prev, { id, variant, message, title: options.title }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast],
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => addToast('success', message, options),
      error: (message, options) => addToast('error', message, options),
      info: (message, options) => addToast('info', message, options),
      warning: (message, options) => addToast('warning', message, options),
      dismiss: removeToast,
    }),
    [addToast, removeToast],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};
