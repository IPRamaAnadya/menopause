import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      provider?: string;
      role?: string;
      isResetPassword?: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    provider?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    provider?: string;
    role?: string;
    isResetPassword?: boolean;
  }
}
