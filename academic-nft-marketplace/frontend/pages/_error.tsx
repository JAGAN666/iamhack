import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: {
    message: string;
    statusCode?: number;
  };
}

const Error: NextPage<ErrorProps> = ({ statusCode, hasGetInitialPropsRun, err }) => {
  const getErrorMessage = () => {
    if (statusCode === 404) {
      return {
        title: 'Page Not Found',
        description: 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
        action: 'Return Home'
      };
    }
    
    if (statusCode === 500) {
      return {
        title: 'Internal Server Error',
        description: 'Something went wrong on our servers. Our team has been notified and is working to fix the issue.',
        action: 'Try Again'
      };
    }

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return {
        title: 'Client Error',
        description: 'There seems to be an issue with your request. Please check and try again.',
        action: 'Go Back'
      };
    }

    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.',
      action: 'Refresh Page'
    };
  };

  const errorInfo = getErrorMessage();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <>
      <Head>
        <title>{statusCode ? `Error ${statusCode}` : 'Error'} | Academic NFT Marketplace</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6"
            >
              <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
            </motion.div>

            {/* Status Code */}
            {statusCode && (
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-6xl font-bold text-white mb-4"
              >
                {statusCode}
              </motion.h1>
            )}

            {/* Error Title */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-semibold text-white mb-4"
            >
              {errorInfo.title}
            </motion.h2>

            {/* Error Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-300 mb-8 leading-relaxed"
            >
              {errorInfo.description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              {/* Primary Action */}
              {statusCode === 404 ? (
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span>{errorInfo.action}</span>
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  onClick={handleRefresh}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>{errorInfo.action}</span>
                </motion.button>
              )}

              {/* Secondary Actions */}
              <div className="flex space-x-3">
                <motion.button
                  onClick={handleGoBack}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go Back
                </motion.button>
                
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Home
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Additional Info for Development */}
            {process.env.NODE_ENV === 'development' && err && (
              <motion.details
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 text-left bg-slate-800 rounded-lg p-4"
              >
                <summary className="cursor-pointer text-slate-300 font-medium mb-2">
                  Debug Information
                </summary>
                <pre className="text-xs text-red-300 overflow-auto">
                  {JSON.stringify({ statusCode, err, hasGetInitialPropsRun }, null, 2)}
                </pre>
              </motion.details>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

Error.getInitialProps = async ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;
  
  // Log error for monitoring
  if (err && process.env.NODE_ENV === 'production') {
    console.error('Application Error:', {
      statusCode,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }

  return { statusCode, hasGetInitialPropsRun: true };
};

export default Error;