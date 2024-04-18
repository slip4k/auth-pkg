import NextAuth from 'next-auth/next';

declare module 'next-auth' {
  interface Session {
    user: User & {
      username: string;
    };
    token: {
      username: string;
    };
  }
}
