import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const VerifyEmailPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  const { verifyEmail, resendVerification, pendingVerification, user } = useAuth();
  const router = useRouter();

  // Get email from query params or pending verification state
  const email = (router.query.email as string) || pendingVerification;

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (user && user.emailVerified) {
      router.push('/dashboard');
      return;
    }

    // If no email to verify, redirect to registration
    if (!email) {
      router.push('/register');
      return;
    }
  }, [user, email, router]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otpCode) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await verifyEmail(email, otpCode);
      setSuccess('Email verified successfully! Redirecting to dashboard...');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      setError(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || countdown > 0) return;

    setResendLoading(true);
    setResendSuccess('');
    setError('');

    try {
      await resendVerification(email);
      setResendSuccess('Verification code sent successfully!');
      setCountdown(60); // 60 second cooldown
    } catch (error: any) {
      setError(error.message || 'Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout title="Verify Email - Academic NFT Marketplace">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
              <EnvelopeIcon className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-center text-sm font-medium text-indigo-600">
              {email}
            </p>
          </motion.div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10"
          >
            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-green-50 border border-green-200 rounded-md p-4"
              >
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                  <div className="text-sm">
                    <p className="text-green-800">{success}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-md p-4"
              >
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                  <div className="text-sm">
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {resendSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4"
              >
                <div className="flex">
                  <CheckCircleIcon className="h-5 w-5 text-blue-400 mr-2" />
                  <div className="text-sm">
                    <p className="text-blue-800">{resendSuccess}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit verification code
                </label>
                <input
                  id="otpCode"
                  name="otpCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={handleOtpChange}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 text-center text-2xl tracking-widest rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="000000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Check your email inbox and spam folder
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Didn't receive the code?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || countdown > 0}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center">
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      Sending...
                    </span>
                  ) : countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    'Resend verification code'
                  )}
                </button>
              </div>

              <div className="mt-4 text-center">
                <Link
                  href="/register"
                  className="text-sm text-gray-600 hover:text-gray-500 transition-colors duration-200"
                >
                  ← Back to registration
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Verification Help
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Check your email inbox for the verification code</p>
                <p>• Look in your spam/junk folder if you don't see it</p>
                <p>• The code expires in 10 minutes</p>
                <p>• Need help? Contact support at help@academicnft.com</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage;