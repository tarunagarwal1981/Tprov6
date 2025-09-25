'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useImprovedAuth } from '@/context/ImprovedAuthContext';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ModernLoginForm() {
  const { signIn, resetPassword, state, clearError } = useImprovedAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentView, setCurrentView] = useState<'login' | 'forgot-password' | 'success'>('login');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isSubmitting: isForgotSubmitting },
    setError: setForgotError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect after successful login - Fixed to prevent loops
  useEffect(() => {
    if (state.user && !state.isLoading && !isRedirecting) {
      const dashboardUrl = getDashboardUrl(state.user.role);
      setIsRedirecting(true);
      
      // Use router.push for smooth navigation instead of window.location.replace
      // This prevents page refreshes and multiple redirects
      router.push(dashboardUrl);
    }
  }, [state.user, state.isLoading, isRedirecting, router]);

  // Helper function to get dashboard URL based on user role
  const getDashboardUrl = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
      case UserRole.SUPER_ADMIN:
        return '/admin/dashboard';
      case UserRole.TOUR_OPERATOR:
        return '/operator/dashboard';
      case UserRole.TRAVEL_AGENT:
        return '/agent/dashboard';
      default:
        return '/';
    }
  };

  // Handle login form submission - Fixed to prevent multiple submissions
  const onSubmit = async (data: LoginFormData) => {
    // Prevent multiple submissions
    if (isSubmitting || state.isLoading || isRedirecting) {
      return;
    }

    try {
      const result = await signIn(data.email, data.password);
      
      if (!result.success) {
        setError('root', { message: result.error || 'Login failed' });
        // Reset redirect state on error
        setIsRedirecting(false);
      }
      // Success is handled by the auth state change effect
    } catch (error) {
      console.error('Login error:', error);
      setError('root', { message: 'An unexpected error occurred' });
      // Reset redirect state on error
      setIsRedirecting(false);
    }
  };

  // Handle forgot password form submission
  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await resetPassword(data.email);

      if (!result.success) {
        setForgotError('root', { message: result.error || 'Failed to send reset email' });
      } else {
        setSuccessMessage('Password reset email sent! Check your inbox for further instructions.');
        setCurrentView('success');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotError('root', { message: 'Failed to send reset email' });
    }
  };

  // Show redirecting state
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {currentView === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-2 text-center pb-8">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Lock className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="Enter your email"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          {...register('email')}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          {...register('rememberMe')}
                        />
                        <Label htmlFor="remember-me" className="text-sm text-gray-600">
                          Remember me
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentView('forgot-password')}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Error Message */}
                    {errors.root && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.root.message}</AlertDescription>
                      </Alert>
                    )}

                    {/* Submit Button - Fixed to prevent multiple clicks */}
                    <Button
                      type="submit"
                      disabled={isSubmitting || state.isLoading || isRedirecting}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting || state.isLoading || isRedirecting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {isRedirecting ? 'Redirecting...' : 'Signing in...'}
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Register Link */}
                  <div className="text-center pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link
                        href="/auth/register"
                        className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                      >
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentView === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-2 text-center pb-8">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <Mail className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Reset your password
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Enter your email address and we'll send you a link to reset your password
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handleForgotSubmit(onForgotPasswordSubmit)} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="forgot-email"
                          type="email"
                          autoComplete="email"
                          placeholder="Enter your email"
                          className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                          {...registerForgot('email')}
                        />
                      </div>
                      {forgotErrors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {forgotErrors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Error Message */}
                    {forgotErrors.root && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{forgotErrors.root.message}</AlertDescription>
                      </Alert>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isForgotSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {isForgotSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send reset link
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Back to Login */}
                  <div className="text-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentView('login')}
                      className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentView === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="space-y-2 text-center pb-8">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Check your email
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {successMessage}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      We've sent a password reset link to your email address. 
                      Click the link in the email to reset your password.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Didn't receive the email?</strong> Check your spam folder or try again.
                      </p>
                    </div>
                  </div>

                  {/* Back to Login */}
                  <div className="text-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setCurrentView('login');
                        reset();
                      }}
                      className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
