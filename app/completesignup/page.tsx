'use client';
import { CompleteSignupForm } from '@/components/CompleteSignupForm';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CompleteSignup() {
  const { data: session, status } = useSession();
  const email = session?.user.email;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {status === 'authenticated' ? (
        <>
          <CompleteSignupForm email={email} />
        </>
      ) : (
        <>
          <p>Hello! You are not authenticated</p>
          <Link href="/">Back to homepage</Link>
        </>
      )}
    </div>
  );
}
