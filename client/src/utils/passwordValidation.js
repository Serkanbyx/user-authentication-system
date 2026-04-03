export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'lowercase', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { key: 'number', label: 'One number', test: (v) => /\d/.test(v) },
];

export const getPasswordStrength = (password) => {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed === 0) return { level: 0, label: '', color: '' };
  if (passed <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (passed <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
  if (passed <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
  return { level: 4, label: 'Strong', color: 'bg-green-500' };
};
