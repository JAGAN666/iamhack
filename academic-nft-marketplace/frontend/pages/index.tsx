import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import Layout from '../src/components/Layout/Layout';
import { AcademicCapIcon, TrophyIcon, UserGroupIcon, LockClosedIcon, StarIcon, SparklesIcon, TicketIcon, CalendarIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Academic Achievement NFTs',
    description: 'Transform your academic accomplishments into unique, verifiable digital assets that showcase your expertise.',
    icon: AcademicCapIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Exclusive Opportunities',
    description: 'Unlock premium research databases, internship fast-tracks, and mentorship programs with your achievement NFTs.',
    icon: TrophyIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Cross-University Network',
    description: 'Connect with students from partner universities and access opportunities across multiple institutions.',
    icon: UserGroupIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Gated Access System',
    description: 'Secure, blockchain-verified access to exclusive events, resources, and premium educational content.',
    icon: LockClosedIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
];

const nftTypes = [
  {
    name: 'GPA Guardian NFT',
    requirement: '3.5+ GPA verification',
    unlocks: 'Premium research databases, honor society events',
    gradient: 'from-blue-500 to-blue-600',
    icon: '🎓',
  },
  {
    name: 'Research Rockstar NFT',
    requirement: 'Published paper/research project',
    unlocks: 'Exclusive internship pools, graduate school fast-track',
    gradient: 'from-green-500 to-green-600',
    icon: '🔬',
  },
  {
    name: 'Leadership Legend NFT',
    requirement: 'Student government/club leadership proof',
    unlocks: 'Startup pitch events, executive mentorship programs',
    gradient: 'from-purple-500 to-purple-600',
    icon: '👑',
  },
];

const partners = [
  'Eastern Michigan University',
  'Eastern University',
  'Thomas Edison State University',
  'Oakland University',
  'Virginia Tech',
];


// Floating Elements Component
const FloatingElements: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1200); // Default width for SSR
  
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

  // Use deterministic positioning based on index instead of random
  const getElementPosition = (index: number) => ({
    y: (index * 150) % 400, // Deterministic vertical positioning
    x: -100,
    top: `${(index * 13) % 80}%`, // Deterministic top positioning
    fontSize: `${2 + (index * 0.3) % 2}rem`, // Deterministic font size
    duration: 20 + (index * 2) % 10, // Deterministic duration
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => {
        const pos = getElementPosition(i);
        return (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-10"
            initial={{ x: pos.x, y: pos.y }}
            animate={{ 
              x: [null, screenWidth + 100],
              y: [null, pos.y + 50],
              rotate: [0, 360]
            }}
            transition={{
              duration: pos.duration,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
            style={{
              top: pos.top,
              fontSize: pos.fontSize,
            }}
          >
            {['🎓', '🏆', '📚', '⭐', '💎', '🚀'][i]}
          </motion.div>
        );
      })}
    </div>
  );
};

const HomePage: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
        <FloatingElements />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen py-12 lg:py-24">
            
            {/* Left Content */}
            <motion.div 
              className="flex-1 text-center lg:text-left lg:pr-12"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >

              <motion.h1 
                className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Transform Your{' '}
                <motion.span
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundSize: '200% 200%',
                  }}
                >
                  Academic Achievements
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                The first cross-university platform where academic achievements become{' '}
                <span className="text-purple-400 font-semibold">dynamic NFTs</span> that unlock 
                exclusive opportunities across partner institutions.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/register"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10">Get Started</span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600"
                      initial={{ x: '100%' }}
                      whileHover={{ x: '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-purple-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Visual */}
            <motion.div 
              className="flex-1 mt-12 lg:mt-0 lg:pl-12"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative">
                <motion.div
                  className="relative w-full max-w-lg mx-auto"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl p-1 shadow-2xl">
                    <div className="w-full h-full bg-slate-900 rounded-3xl flex items-center justify-center relative overflow-hidden">
                      <motion.div
                        className="text-center text-white"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <motion.div 
                          className="text-8xl mb-4"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          🎓
                        </motion.div>
                        <h3 className="text-3xl font-bold mb-2">Academic Excellence</h3>
                        <p className="text-lg opacity-90">Verified on Blockchain</p>
                      </motion.div>
                      
                      {/* Floating particles around the NFT */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-purple-400 rounded-full"
                          animate={{
                            x: [0, 30 * Math.cos(i * Math.PI / 4)],
                            y: [0, 30 * Math.sin(i * Math.PI / 4)],
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut"
                          }}
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-base text-primary-600 font-semibold tracking-wide uppercase mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Features
            </motion.h2>
            <motion.p 
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Why Choose Academic NFT Marketplace?
            </motion.p>
            <motion.p 
              className="max-w-3xl mx-auto text-xl text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Transform your academic journey with blockchain-verified achievements and unlock exclusive opportunities.
            </motion.p>
          </motion.div>

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-red-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                    {feature.name}
                  </h3>
                  
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Animated accent line */}
                  <motion.div
                    className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-6 origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* NFT Types Section */}
      <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Achievement NFT Types
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Three main NFT categories to showcase your academic excellence and unlock exclusive opportunities
            </motion.p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {nftTypes.map((nft, index) => (
              <motion.div
                key={nft.name}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                {/* Card */}
                <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 h-full">
                  {/* Animated glow effect */}
                  <motion.div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${nft.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-500`}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  <div className="relative z-10">
                    {/* NFT Icon with 3D effect */}
                    <motion.div
                      className="relative mx-auto mb-8"
                      whileHover={{ 
                        rotateY: 15,
                        rotateX: 15,
                        scale: 1.05
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ perspective: 1000 }}
                    >
                      <motion.div 
                        className={`h-40 w-40 mx-auto rounded-3xl bg-gradient-to-r ${nft.gradient} flex items-center justify-center text-6xl shadow-2xl relative`}
                        animate={{
                          boxShadow: [
                            `0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)`,
                            `0 25px 50px -12px rgba(0,0,0,0.25), 0 12px 24px -8px rgba(0,0,0,0.1)`,
                            `0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)`
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <motion.span
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          {nft.icon}
                        </motion.span>
                        
                        {/* Floating particles */}
                        {[...Array(4)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            animate={{
                              x: [0, 20 * Math.cos(i * Math.PI / 2)],
                              y: [0, 20 * Math.sin(i * Math.PI / 2)],
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.5,
                              ease: "easeInOut"
                            }}
                            style={{
                              left: '50%',
                              top: '50%',
                            }}
                          />
                        ))}
                      </motion.div>
                    </motion.div>

                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-6 group-hover:text-purple-600 transition-colors duration-300">
                      {nft.name}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white/50 rounded-2xl backdrop-blur-sm">
                        <span className="font-semibold text-purple-600 block mb-2">📋 Requirement:</span>
                        <p className="text-gray-700">{nft.requirement}</p>
                      </div>
                      
                      <div className="p-4 bg-white/50 rounded-2xl backdrop-blur-sm">
                        <span className="font-semibold text-green-600 block mb-2">🚀 Unlocks:</span>
                        <p className="text-gray-700">{nft.unlocks}</p>
                      </div>
                    </div>

                    {/* Action button */}
                    <motion.button
                      className={`w-full mt-6 py-3 px-6 bg-gradient-to-r ${nft.gradient} text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Learn More
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Universities */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            animate={{
              x: [0, -120, 0],
              y: [0, 60, 0],
              scale: [1.2, 1, 1.2]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              🏫 University Network
            </motion.div>
            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Partner Universities
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Growing network of prestigious institutions pioneering the future of verified academic achievements
            </motion.p>
          </motion.div>

          {/* University Network Visualization */}
          <motion.div 
            className="relative mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Central hub */}
                <motion.div
                  className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl relative z-10"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(168, 85, 247, 0.4)",
                      "0 0 40px rgba(168, 85, 247, 0.6)",
                      "0 0 20px rgba(168, 85, 247, 0.4)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  NFT Hub
                </motion.div>

                {/* Connection lines and university nodes */}
                {partners.map((partner, index) => {
                  const angle = (360 / partners.length) * index;
                  const radius = 200;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  
                  return (
                    <div key={partner}>
                      {/* Connection line */}
                      <motion.div
                        className="absolute w-px bg-gradient-to-r from-purple-300 to-transparent origin-center"
                        style={{
                          left: '50%',
                          top: '50%',
                          height: `${radius}px`,
                          transformOrigin: '0 0',
                          transform: `rotate(${angle}deg)`,
                        }}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        viewport={{ once: true }}
                      />
                      
                      {/* University node */}
                      <motion.div
                        className="absolute w-24 h-24 bg-white rounded-full shadow-lg border-4 border-purple-200 flex items-center justify-center text-center text-xs font-medium text-gray-700 p-2"
                        style={{
                          left: `calc(50% + ${x}px - 48px)`,
                          top: `calc(50% + ${y}px - 48px)`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: 1 + index * 0.1,
                          type: "spring",
                          stiffness: 200,
                          damping: 10
                        }}
                        viewport={{ once: true }}
                        whileHover={{ 
                          scale: 1.1, 
                          borderColor: '#8b5cf6',
                          boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)'
                        }}
                      >
                        {partner.split(' ').map(word => word.slice(0, 2)).join('').toUpperCase()}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* University Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 overflow-hidden"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div className="relative z-10">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    🏛️
                  </motion.div>
                  
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-purple-600 transition-colors duration-300">
                    {partner}
                  </h3>
                  
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Active
                    </span>
                    <span className="flex items-center">
                      <span className="text-purple-500 mr-1">⚡</span>
                      {Math.floor((index * 127) % 500) + 100} NFTs
                    </span>
                  </div>

                  {/* Animated accent line */}
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4 origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Exclusive Events Section */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 py-24 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-yellow-400/20 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-r from-blue-400/20 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 mb-6 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <TicketIcon className="w-4 h-4 mr-2 text-yellow-300" />
              🎫 NFT Exclusive Access
            </motion.div>

            <motion.h2 
              className="text-4xl lg:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Exclusive Academic Events
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-200 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Your NFT achievements unlock VIP access to conferences, workshops, and networking events. 
              Get up to <span className="text-yellow-300 font-bold">100% discount</span> with your NFT collection!
            </motion.p>
          </motion.div>

          {/* Events Preview Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
            {[
              {
                title: "Future of Academic Research Conference",
                date: "Sep 15, 2025",
                location: "Harvard University",
                price: 75,
                discount: "FREE",
                nftType: "Research Rockstar",
                icon: "🔬",
                gradient: "from-green-400 to-blue-500"
              },
              {
                title: "Student Leadership Summit 2025",
                date: "Aug 22, 2025",
                location: "Stanford University",
                price: 45,
                discount: "FREE",
                nftType: "Leadership Legend",
                icon: "👑",
                gradient: "from-purple-400 to-pink-500"
              },
              {
                title: "Cross-University Networking Night",
                date: "Aug 30, 2025",
                location: "MIT Campus",
                price: 25,
                discount: "40% OFF",
                nftType: "Leadership Legend",
                icon: "🎓",
                gradient: "from-blue-400 to-purple-500"
              }
            ].map((event, index) => (
              <motion.div
                key={event.title}
                className="group bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-500"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                {/* Event Icon */}
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-r ${event.gradient} rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {event.icon}
                </motion.div>

                {/* Event Details */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="mr-2">📍</span>
                      {event.location}
                    </div>
                  </div>

                  {/* Discount Badge */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-white line-through opacity-60">
                        ${event.price}
                      </div>
                      <div className="inline-block px-3 py-1 bg-green-400 text-green-900 rounded-full text-sm font-bold">
                        {event.discount}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">With {event.nftType}</div>
                      <div className="text-2xl">{event.icon}</div>
                    </div>
                  </div>

                  {/* Action hint */}
                  <motion.div
                    className="text-center pt-2 border-t border-white/20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-xs text-gray-400">Click to view details</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/tickets"
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-purple-600 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2" />
                    Browse All Events
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </span>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl hover:shadow-xl transition-all duration-300"
                >
                  <span className="flex items-center">
                    <TicketIcon className="w-6 h-6 mr-2" />
                    Get NFTs & Save
                    <motion.span
                      className="ml-2 group-hover:rotate-45 transition-transform duration-300"
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ⚡
                    </motion.span>
                  </span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background animation elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              x: [0, 100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              x: [0, -100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              delay: 5
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => {
            // Use deterministic positioning based on index
            const xPos = (i * 100) % 1200;
            const yPos = (i * 50) % 400;
            const xPosEnd = ((i + 6) * 100) % 1200;
            const yPosEnd = ((i + 3) * 50) % 400;
            
            return (
              <motion.div
                key={i}
                className="absolute text-2xl opacity-20"
                initial={{ 
                  x: xPos, 
                  y: yPos 
                }}
                animate={{ 
                  y: [null, -100, yPosEnd],
                  x: [null, xPosEnd],
                  rotate: [0, 360],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{
                  duration: 15 + (i % 10),
                  repeat: Infinity,
                  delay: i * 1.5,
                  ease: "linear"
                }}
              >
                {['🎓', '🏆', '⭐', '💎', '🚀', '🎯'][i % 6]}
              </motion.div>
            );
          })}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:py-32 lg:px-8">
          <div className="text-center">
            <motion.div
              className="inline-flex items-center px-4 py-2 mb-8 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <SparklesIcon className="w-4 h-4 mr-2 text-yellow-400" />
              🚀 Join the Revolution
            </motion.div>

            <motion.h2 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Ready to{' '}
              <motion.span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              >
                Transform
              </motion.span>
              {' '}Your Future?
            </motion.h2>
            
            <motion.p 
              className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Join thousands of students already revolutionizing academic achievement with blockchain-verified NFTs. 
              Your journey to exclusive opportunities starts here.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center">
                    Create Your Account
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600"
                    initial={{ x: '100%' }}
                    whileHover={{ x: '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-purple-300 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl hover:bg-white/20 hover:border-white/40 transition-all duration-300"
                >
                  <span className="flex items-center">
                    Sign In
                    <motion.span
                      className="ml-2 group-hover:rotate-45 transition-transform duration-300"
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      ⚡
                    </motion.span>
                  </span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {[
                { icon: '🔒', label: 'Blockchain Secured', desc: 'Immutable verification' },
                { icon: '🌍', label: '25+ Universities', desc: 'Growing network' },
                { icon: '⚡', label: 'Instant Access', desc: 'Unlock opportunities' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="text-white font-semibold mb-1">{item.label}</div>
                  <div className="text-gray-400 text-sm">{item.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;