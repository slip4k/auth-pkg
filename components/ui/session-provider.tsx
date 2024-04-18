'use client';
import { SessionProvider } from 'next-auth/react';
import { FC, ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}
const SeshProvider: FC<SessionProviderProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default SeshProvider;
