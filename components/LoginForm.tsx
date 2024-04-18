'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters',
  }),
});

export function LoginForm() {
  const [formError, setFormError] = useState('');
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const { username, password } = data;

    const signInData = await signIn('credentials', {
      username: username,
      password: password,
      redirect: false,
    });
    if (signInData?.error) {
      setFormError(signInData.error);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <>
      <h1>Log In</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-1/4 space-y-6"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Username..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {formError && (
            <div className="text-center font-medium text-destructive">
              {formError}
            </div>
          )}
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
      </Form>
      <div className="border-t mt-4 pt-4 w-1/4">
        <Button className="w-full mt-2">
          <Link href="/signup">Sign Up with Email</Link>
        </Button>
        <Button
          className="w-full mt-6"
          onClick={async () => {
            await signIn('google');
          }}
        >
          <Image src={'/google.svg'} alt="Google Logo" width={24} height={24} />
          Sign in with Google
        </Button>
      </div>
    </>
  );
}
