'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Building, Loader2, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create account');
      }

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="glass-card p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent-cyan" />
              <div className="absolute inset-[2px] rounded-[10px] bg-dark flex items-center justify-center">
                <span className="text-xl font-bold gradient-text">B</span>
              </div>
            </div>
            <span className="text-2xl font-bold text-white">Bravilio</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-white/60">Start your 14-day free trial</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="pl-10"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspaceName">Workspace Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                id="workspaceName"
                type="text"
                placeholder="My Company"
                className="pl-10"
                {...register('workspaceName')}
              />
            </div>
            {errors.workspaceName && (
              <p className="text-sm text-red-400">{errors.workspaceName.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="cyan"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-dark-50 text-white/40">Or continue with</span>
          </div>
        </div>

        <Button
          variant="glass"
          className="w-full"
          onClick={handleGoogleSignIn}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>

        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-cyan hover:text-accent-sky">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-white/40">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-white/60">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-white/60">
            Privacy Policy
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
