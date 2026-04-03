const variantClasses = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600 border border-transparent',
  secondary:
    'bg-white text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus-visible:outline-gray-400 border border-transparent',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:outline-red-600 border border-transparent',
};

const spinnerRingByVariant = {
  primary: 'border-white/30 border-t-white',
  secondary: 'border-gray-200 border-t-gray-800',
  danger: 'border-white/30 border-t-white',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';

/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: 'primary' | 'secondary' | 'danger';
 *   loading?: boolean;
 *   fullWidth?: boolean;
 * }} props
 */
const Button = ({
  type = 'button',
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <span
            className={`h-4 w-4 shrink-0 animate-spin rounded-full border-2 ${spinnerRingByVariant[variant]}`}
            aria-hidden="true"
          />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
