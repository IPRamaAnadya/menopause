import { SignInForm } from '@/features/auth';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4">
      <SignInForm />
    </div>
  );
}
