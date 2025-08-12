import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Custom404: React.FC = () => {
  const handleSearch = () => {
    // This could integrate with your search functionality
    window.location.href = '/opportunities?search=true';
  };

  const popularPages = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Opportunities', href: '/opportunities', icon: 'opportunities' },
    { name: 'Achievements', href: '/achievements', icon: 'achievements' },
    { name: 'NFT Gallery', href: '/nfts', icon: 'nfts' }
  ];

  return (
    <>
      <Head>
        <title>404 - Page Not Found | Academic NFT Marketplace</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 404 Illustration */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8"
            >
              <div className="relative">
                <motion.h1 
                  className="text-9xl font-bold text-white opacity-10"
                  animate={{ 
                    textShadow: [
                      "0 0 0px #6366f1",
                      "0 0 20px #6366f1", 
                      "0 0 0px #6366f1"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  404
                </motion.h1>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-indigo-500 border-dashed rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                The page you&apos;re looking for seems to have wandered off into the blockchain. 
                Don&apos;t worry, let&apos;s get you back on track!
              </p>
            </motion.div>

            {/* Search Suggestion */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700">
                <h3 className="text-white font-semibold mb-3 flex items-center justify-center space-x-2">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Looking for something specific?</span>
                </h3>
                <motion.button
                  onClick={handleSearch}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Search Opportunities
                </motion.button>
              </div>
            </motion.div>

            {/* Popular Pages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-white font-semibold mb-4">Popular Pages</h3>
              <div className="grid grid-cols-2 gap-3">
                {popularPages.map((page, index) => (
                  <motion.div
                    key={page.name}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Link href={page.href}>
                      <motion.div
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(99, 102, 241, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-indigo-500 rounded-lg p-4 transition-all cursor-pointer"
                      >
                        <div className="text-indigo-400 mb-2">
                          <DocumentTextIcon className="w-6 h-6 mx-auto" />
                        </div>
                        <div className="text-white font-medium text-sm">
                          {page.name}
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <HomeIcon className="w-5 h-5" />
                  <span>Back to Home</span>
                </motion.button>
              </Link>

              <div className="flex space-x-3">
                <motion.button
                  onClick={() => window.history.back()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  <span>Go Back</span>
                </motion.button>
                
                <motion.button
                  onClick={() => window.location.reload()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Refresh
                </motion.button>
              </div>
            </motion.div>

            {/* Fun Fact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <p className="text-slate-400 text-sm">
                💡 <strong>Did you know?</strong> Every 404 error is a chance to discover something new. 
                Explore our platform and unlock new achievements!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Custom404;