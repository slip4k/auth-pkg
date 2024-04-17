import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from './db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { Adapter } from 'next-auth/adapters';
import { compare } from 'bcrypt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
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
          existingUser.password
        );

        if (!passwordMatch) {
          throw new Error('Password is incorrect');
        }

        if (!existingUser.emailVerified) {
          throw new Error('Please verify your email');
        }

        return {
          id: existingUser.id.toString(),
          username: existingUser.username,
          email: existingUser.email,
          avatar: existingUser.avatar || '',
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // profile(profile) {
      //   return {
      //     id: profile.sub,
      //     firstName: profile.given_name,
      //     lastName: profile.family_name,
      //     email: profile.email,
      //   }
      // }
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        if (!profile?.email) {
          throw new Error('No Profile');
        }
        console.log(profile.name);
        await db.user.upsert({
          where: {
            email: profile.email,
          },
          create: {
            email: profile.email,
            firstName: profile.name,
            username: profile.name + '213',
            password: profile.name + '213',
          },
          update: {
            firstName: profile.name,
          },
        });
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        return { ...token, ...session.user };
      }
      if (user) {
        return { ...token };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          username: token.username,
          avatar: token.avatar,
        },
      };
    },
  },
};
