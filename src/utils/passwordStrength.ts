export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  level: PasswordStrengthLevel;
  label: string;
  checks: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
    hasUpper: boolean;
    hasSpecial: boolean;
  };
}

const LABELS: Record<PasswordStrengthLevel, string> = {
  empty: '',
  weak: 'Fraca',
  fair: 'Razoável',
  good: 'Boa',
  strong: 'Forte',
};

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };

  if (!password) {
    return { score: 0, level: 'empty', label: LABELS.empty, checks };
  }

  if (!checks.minLength || !checks.hasLetter || !checks.hasNumber) {
    return { score: 1, level: 'weak', label: LABELS.weak, checks };
  }

  if (password.length >= 8 && checks.hasUpper && checks.hasSpecial) {
    return { score: 4, level: 'strong', label: LABELS.strong, checks };
  }

  if (password.length >= 8 && checks.hasUpper) {
    return { score: 3, level: 'good', label: LABELS.good, checks };
  }

  return { score: 2, level: 'fair', label: LABELS.fair, checks };
}
