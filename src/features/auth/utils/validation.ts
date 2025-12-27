import { AuthError } from '../types';

/**
 * Get user-friendly error message from Firebase auth error
 */
export function getAuthErrorMessage(error: any): string {
  const code = error?.code || '';

  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
    'auth/popup-blocked': 'Popup was blocked by the browser.',
    'auth/invalid-credential': 'Invalid credentials provided.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  };

  return errorMessages[code] || error?.message || 'An unexpected error occurred.';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long.' };
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters.' };
  }

  return { isValid: true };
}

/**
 * Check if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}
