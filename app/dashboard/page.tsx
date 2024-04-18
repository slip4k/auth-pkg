'use client';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const sessionInfo = session?.user;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {status === 'authenticated' ? (
        <>
          <p>You are authenticated!</p>
          <div></div>
          <Button onClick={() => signOut({ callbackUrl: '/' })}>
            Sign Out
          </Button>
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
