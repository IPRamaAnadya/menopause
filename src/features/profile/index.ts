// Profile feature exports
// Note: ProfileService is intentionally not exported here to prevent
// server-side code (Prisma) from being bundled in client components
// Import ProfileService directly in API routes only

export * from './types';
export * from './hooks/useProfile';
