import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import type { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  
  providers: [
    // Google Provider using Firebase credentials
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
    }),

    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Handle redirects after sign in
      // If URL is already provided, use it
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Default redirect based on user role - this will be set in session callback
      return baseUrl;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.image = token.picture;
        session.user.role = token.role as string;
        session.user.isResetPassword = token.isResetPassword as boolean;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },

    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        
        // Fetch user details including role and reset password flag
        const dbUser = await prisma.users.findUnique({
          where: { id: parseInt(user.id) },
          include: {
            user_roles: {
              include: {
                roles: true,
              },
            },
          },
        });

        if (dbUser) {
          token.role = dbUser.user_roles[0]?.roles.name || 'Member';
          token.isResetPassword = dbUser.is_reset_password;
          token.emailVerified = dbUser.email_verified;
        }
      }
      
      // Refresh user data when session is updated (e.g., after email verification)
      if (trigger === 'update' && token.sub) {
        const dbUser = await prisma.users.findUnique({
          where: { id: parseInt(token.sub) },
          select: {
            email_verified: true,
            is_reset_password: true,
          },
        });
        
        if (dbUser) {
          token.emailVerified = dbUser.email_verified;
          token.isResetPassword = dbUser.is_reset_password;
        }
      }
      
      // Track provider for analytics
      if (account) {
        token.provider = account.provider;
      }
      
      return token;
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};
