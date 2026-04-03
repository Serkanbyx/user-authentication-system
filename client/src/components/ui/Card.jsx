import { createElement } from 'react';

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * @param {{
 *   as?: string;
 *   padding?: 'none' | 'sm' | 'md' | 'lg';
 *   className?: string;
 *   children?: import('react').ReactNode;
 * }} props
 */
const Card = ({
  as = 'div',
  padding = 'lg',
  className = '',
  children,
  ...rest
}) => {
  const pad = paddingMap[padding] ?? paddingMap.lg;

  return createElement(
    as,
    {
      className: `rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 ${pad} ${className}`,
      ...rest,
    },
    children
  );
};

export default Card;
