import { forwardRef } from 'react';

const renderLabel = (label, id) => {
  if (label == null) return null;

  if (typeof label === 'string') {
    return (
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    );
  }

  return (
    <label htmlFor={id} className="block">
      {label}
    </label>
  );
};

const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    startIcon,
    endIcon,
    className = '',
    inputClassName = '',
    ...props
  },
  ref
) {
  const hasError = Boolean(error);
  const borderRing = hasError
    ? 'border-red-300 focus:ring-red-500'
    : 'border-gray-300 focus:ring-indigo-600';

  const paddingWithIcons = `${startIcon ? 'pl-10' : ''} ${endIcon ? 'pr-10' : ''}`.trim();

  const inputBase =
    'block w-full rounded-lg border px-3.5 py-2.5 text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-inset';

  const describedBy = error && id ? `${id}-error` : undefined;

  return (
    <div className={className}>
      {renderLabel(label, id)}
      <div className={label != null ? 'relative mt-1.5' : 'relative'}>
        {startIcon ? (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 [&_svg]:h-5 [&_svg]:w-5"
            aria-hidden="true"
          >
            {startIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          className={`${inputBase} ${borderRing} ${paddingWithIcons} ${inputClassName}`}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {endIcon ? (
          <span
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 [&_svg]:h-5 [&_svg]:w-5"
            aria-hidden="true"
          >
            {endIcon}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={describedBy} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
