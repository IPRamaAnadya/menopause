import {
  Auth,
  User,
  UserCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { IAuthService } from './auth.interface';
import { firebase } from '../core';

/**
 * Firebase Authentication Service Implementation
 */
export class FirebaseAuthService implements IAuthService {
  private auth: Auth;
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.auth = firebase.getAuth();
    this.googleProvider = new GoogleAuthProvider();
    
    // Optional: Add custom parameters for Google sign-in
    this.googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }

  public getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, callback);
  }

  public async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('User signed in:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  public async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('User created:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  public async signInWithGoogle(): Promise<UserCredential> {
    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      console.log('User signed in with Google:', userCredential.user.email);
      return userCredential;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  public async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  public async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(this.auth, email);
      console.log('Password reset email sent to:', email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  public async updatePassword(newPassword: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      await firebaseUpdatePassword(user, newPassword);
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  public async updateProfile(displayName?: string, photoURL?: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    try {
      await firebaseUpdateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL,
      });
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

// Export singleton instance
let authServiceInstance: FirebaseAuthService | null = null;

export const getAuthService = (): FirebaseAuthService => {
  if (typeof window === 'undefined') {
    throw new Error('Auth service can only be used in browser environment');
  }

  if (!authServiceInstance) {
    authServiceInstance = new FirebaseAuthService();
  }
  return authServiceInstance;
};
