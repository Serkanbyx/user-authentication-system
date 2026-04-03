import { describe, it, expect } from 'vitest';
import { PASSWORD_RULES, getPasswordStrength } from '../utils/passwordValidation';

describe('PASSWORD_RULES', () => {
  it('should have 4 rules', () => {
    expect(PASSWORD_RULES).toHaveLength(4);
  });

  it('length rule requires at least 8 characters', () => {
    const rule = PASSWORD_RULES.find((r) => r.key === 'length');
    expect(rule.test('short')).toBe(false);
    expect(rule.test('12345678')).toBe(true);
    expect(rule.test('longenoughpassword')).toBe(true);
  });

  it('uppercase rule requires at least one uppercase letter', () => {
    const rule = PASSWORD_RULES.find((r) => r.key === 'uppercase');
    expect(rule.test('alllowercase')).toBe(false);
    expect(rule.test('hasUpperCase')).toBe(true);
  });

  it('lowercase rule requires at least one lowercase letter', () => {
    const rule = PASSWORD_RULES.find((r) => r.key === 'lowercase');
    expect(rule.test('ALLUPPERCASE')).toBe(false);
    expect(rule.test('HASLOWERcase')).toBe(true);
  });

  it('number rule requires at least one digit', () => {
    const rule = PASSWORD_RULES.find((r) => r.key === 'number');
    expect(rule.test('nonumbers')).toBe(false);
    expect(rule.test('has1number')).toBe(true);
  });
});

describe('getPasswordStrength', () => {
  it('should return level 0 for empty password', () => {
    const result = getPasswordStrength('');
    expect(result.level).toBe(0);
    expect(result.label).toBe('');
  });

  it('should return "Weak" when only 1 rule passes', () => {
    const result = getPasswordStrength('a');
    expect(result.level).toBe(1);
    expect(result.label).toBe('Weak');
    expect(result.color).toBe('bg-red-500');
  });

  it('should return "Fair" when 2 rules pass', () => {
    const result = getPasswordStrength('abcde1');
    expect(result.level).toBe(2);
    expect(result.label).toBe('Fair');
    expect(result.color).toBe('bg-orange-500');
  });

  it('should return "Good" when 3 rules pass', () => {
    const result = getPasswordStrength('Abcde1');
    expect(result.level).toBe(3);
    expect(result.label).toBe('Good');
    expect(result.color).toBe('bg-yellow-500');
  });

  it('should return "Strong" when all 4 rules pass', () => {
    const result = getPasswordStrength('Abcde123');
    expect(result.level).toBe(4);
    expect(result.label).toBe('Strong');
    expect(result.color).toBe('bg-green-500');
  });
});
