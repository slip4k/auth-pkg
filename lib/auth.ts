import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from './db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Adapter } from 'next-auth/adapters';
import { compare } from 'bcrypt';
import { userAgent } from 'next/server';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
    signOut: '/dashboard',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Username' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Password',
        },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }
        const existingUsers = await db.user.findMany({
          where: {
            username: { contains: credentials?.username, mode: 'insensitive' },
          },
        });

        const existingUser = existingUsers[0];

        if (!existingUser) {
          throw new Error('User does not exist');
        }

        const passwordMatch = await compare(
          credentials.password,
          existingUser.password!
        );

        if (!passwordMatch) {
          throw new Error('Password is incorrect');
        }

        return {
          id: existingUser.id.toString(),
          username: existingUser.username,
          email: existingUser.email,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        if (!profile?.email) {
          throw new Error('No Profile');
        }
        // console.log('profile', profile);
        // console.log('account', account);

        const user = await db.user.upsert({
          where: {
            email: profile.email,
          },
          create: {
            email: profile.email,
            accounts: {
              create: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                accessToken: account.access_token,
                accessTokenExpires: account.expires_at
                  ? new Date(account.expires_at * 1000)
                  : null,
              },
            },
          },
          update: {
            accounts: {
              upsert: {
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
                update: {
                  accessToken: account.access_token,
                  accessTokenExpires: account.expires_at
                    ? new Date(account.expires_at * 1000)
                    : null,
                },
                create: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  accessToken: account.access_token,
                  accessTokenExpires: account.expires_at
                    ? new Date(account.expires_at * 1000)
                    : null,
                },
              },
            },
          },
        });
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      const urlObj = new URL(url);
      const authAction = urlObj.searchParams.get('authAction');
      if (authAction === 'signOut') {
        return baseUrl;
      } else {
        return baseUrl + '/dashboard';
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        return { ...token, ...session.user };
      }
      if (user) {
        return { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          username: token.username,
        },
      };
    },
  },
};
