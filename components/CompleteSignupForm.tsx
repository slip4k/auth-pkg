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
import { signIn, useSession } from 'next-auth/react';
import { completeSignUp, signUp } from '@/lib/serverActions';
import { useRouter } from 'next/navigation';

const FormSchema = z
  .object({
    username: z.string().min(2, {
      message: 'Username must be at least 2 characters.',
    }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters',
    }),
    passwordMatch: z.string().min(8, {
      message: 'Password must be at least 8 characters',
    }),
  })
  .refine((data) => data.password === data.passwordMatch, {
    message: 'Passwords must match',
    path: ['passwordMatch'],
  });

export function CompleteSignupForm({ email }: { email: string }) {
  const { data: session, update } = useSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
      passwordMatch: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // const newUser = await signUp()
    const userCredentials = {
      email,
      username: data.username,
      password: data.password,
    };

    try {
      const newUser = await completeSignUp(userCredentials);
      if (newUser && 'message' in newUser) {
        toast({
          title: 'Error',
          description: newUser.message,
        });
        return; // Stop execution if there was an error
      }

      if (newUser && 'username' in newUser) {
        await update({
          ...session,
          user: {
            ...session?.user,
            username: newUser.username,
          },
        });
      }

      toast({
        title: 'You submitted the following values:',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(data, null, 4)}</code>
          </pre>
        ),
      });
    } catch (error) {
      console.log(error);
    } finally {
      router.push('/');
    }
  }

  return (
    <>
      <h1>Set your username and password</h1>
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
          <FormField
            control={form.control}
            name="passwordMatch"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" type="submit">
            Submit
          </Button>
        </form>
      </Form>
      <div className="border-t mt-4 pt-4 w-1/4">
        <Button
          className="w-full"
          onClick={async () => {
            await signIn('google');
          }}
        >
          <Image src={'/google.svg'} alt="Google Logo" width={24} height={24} />
          Sign up with Google
        </Button>
      </div>
    </>
  );
}
