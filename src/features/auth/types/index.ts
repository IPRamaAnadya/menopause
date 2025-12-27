export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export type AuthProvider = 'email' | 'google' | 'facebook' | 'apple';
