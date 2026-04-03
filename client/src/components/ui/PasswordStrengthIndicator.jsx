import { PASSWORD_RULES, getPasswordStrength } from '../../utils/passwordValidation';

const levelTextColor = {
  1: 'text-red-600',
  2: 'text-orange-600',
  3: 'text-yellow-600',
  4: 'text-green-600',
};

const PasswordStrengthIndicator = ({ password }) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500">Password strength</span>
        <span className={`text-xs font-medium ${levelTextColor[strength.level] || ''}`}>
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < strength.level ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <ul className="mt-2.5 space-y-1">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
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
  );
};

export default PasswordStrengthIndicator;
