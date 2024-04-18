'use server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { UserCredentials } from './types';
import * as bcrypt from 'bcrypt';

export const signUp = async (userCredentials: UserCredentials) => {
  const { email, username, password } = userCredentials;

  try {
    const existingUserByEmail = await db.user.findUnique({
      where: { email: email },
    });
    if (existingUserByEmail) {
      return { message: 'User with this email already exists.' };
    }
    const existingUserByUserName = await db.user.findUnique({
      where: { username: username },
    });
    if (existingUserByUserName) {
      return { message: 'User with this username already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    };

    return userResponse;
  } catch (error) {
    console.error(error);
  }
};
