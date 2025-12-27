import { User, UserCredential } from 'firebase/auth';

/**
 * Authentication service interface
 * Defines the contract for authentication operations
 */
export interface IAuthService {
  // User state
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  // Email/Password authentication
  signInWithEmail(email: string, password: string): Promise<UserCredential>;
  signUpWithEmail(email: string, password: string): Promise<UserCredential>;
  signOut(): Promise<void>;

  // OAuth authentication
  signInWithGoogle(): Promise<UserCredential>;

  // Password management
  sendPasswordResetEmail(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;

  // User profile
  updateProfile(displayName?: string, photoURL?: string): Promise<void>;

  // Helper
  isAuthenticated(): boolean;
}
