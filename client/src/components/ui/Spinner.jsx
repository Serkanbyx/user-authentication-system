const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
};

/**
 * @param {{ className?: string; size?: 'sm' | 'md' | 'lg'; label?: string }} props
 */
const Spinner = ({ className = '', size = 'md', label }) => {
  const dims = sizeMap[size] || sizeMap.md;

  return (
    <span
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || 'Loading'}
    >
      <span
        className={`${dims} animate-spin rounded-full border-gray-200 border-t-indigo-600`}
        aria-hidden="true"
      />
    </span>
  );
};

export default Spinner;
