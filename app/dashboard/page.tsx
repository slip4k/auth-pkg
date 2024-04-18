'use client';
import { Button } from '@/components/ui/button';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  console.log(session);
  const hasUsername = Boolean(session?.user?.username);

  useEffect(() => {
    if (!hasUsername && status === 'authenticated') {
      router.push('/completesignup');
    }
  }, [hasUsername, status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      {status === 'authenticated' ? (
        <>
          <p>You are authenticated!</p>
          <Button
            className="mt-8"
            onClick={() => {
              signOut({
                callbackUrl: `${window.location.origin}/post-auth?authAction=signOut`,
              });
            }}
          >
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
