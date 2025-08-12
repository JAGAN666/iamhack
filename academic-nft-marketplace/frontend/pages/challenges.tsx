import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  UsersIcon,
  CubeIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'tournament' | 'battle' | 'achievement' | 'collaboration';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  reward: string;
  participants: number;
  max_participants?: number;
  duration: string;
  deadline: string;
  requirements: string[];
  nft_reward?: string;
  xp_reward: number;
  status: 'active' | 'upcoming' | 'completed';
  category: string;
  entry_requirements?: string[];
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  participants: number;
  prize_pool: string;
  start_date: string;
  end_date: string;
  status: 'registration' | 'active' | 'completed' | 'upcoming';
  entry_fee?: string;
  categories: string[];
}

const ChallengesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchChallengesData();
    }
  }, [user, authLoading, router]);

  const fetchChallengesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/challenges', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(response.data.challenges);
      setTournaments(response.data.tournaments);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch challenges data:', error);
      toast.error('Failed to load challenges');
      // Fallback to mock data if API fails
      setMockData();
      setLoading(false);
    }
  };

  const setMockData = () => {
    setChallenges([
      {
        id: 'challenge-1',
        title: '🏆 Research Rockstar Challenge',
        description: 'Publish a peer-reviewed research paper and earn the ultimate academic NFT',
        type: 'achievement',
        difficulty: 'Advanced',
        reward: 'Research Legend NFT + 1000 XP',
        participants: 245,
        duration: '3 months',
        deadline: '2025-03-15',
        requirements: ['Active student status', 'Research experience', 'Academic mentor'],
        nft_reward: 'Research Legend NFT',
        xp_reward: 1000,
        status: 'active',
        category: 'Research',
        entry_requirements: ['GPA 3.5+', 'Research background']
      },
      {
        id: 'challenge-2',
        title: '⚔️ Academic Battle Royale',
        description: 'Compete in weekly knowledge battles across multiple disciplines',
        type: 'battle',
        difficulty: 'Intermediate',
        reward: 'Battle Champion Badge + 500 XP',
        participants: 892,
        max_participants: 1000,
        duration: '1 week',
        deadline: '2025-08-18',
        requirements: ['Verified student', 'At least 1 achievement NFT'],
        xp_reward: 500,
        status: 'active',
        category: 'Competition'
      },
      {
        id: 'challenge-3',
        title: '🚀 Innovation Sprint',
        description: 'Create a solution to a real-world problem in 48 hours',
        type: 'tournament',
        difficulty: 'Expert',
        reward: '$5,000 Prize Pool + Innovation NFT',
        participants: 156,
        max_participants: 200,
        duration: '48 hours',
        deadline: '2025-09-01',
        requirements: ['Team of 2-4', 'Technical skills', 'Presentation ready'],
        nft_reward: 'Innovation Master NFT',
        xp_reward: 750,
        status: 'upcoming',
        category: 'Innovation'
      },
      {
        id: 'challenge-4',
        title: '🤝 Cross-University Collaboration',
        description: 'Partner with students from different universities on joint projects',
        type: 'collaboration',
        difficulty: 'Beginner',
        reward: 'Collaboration Master Badge + 300 XP',
        participants: 324,
        duration: '2 months',
        deadline: '2025-10-01',
        requirements: ['Open to collaboration', 'Communication skills'],
        xp_reward: 300,
        status: 'active',
        category: 'Networking'
      },
      {
        id: 'challenge-5',
        title: '🎨 Creative Expression Challenge',
        description: 'Showcase your creative skills through digital art, writing, or multimedia',
        type: 'achievement',
        difficulty: 'Intermediate',
        reward: 'Creative Genius NFT + 400 XP',
        participants: 178,
        duration: '1 month',
        deadline: '2025-08-30',
        requirements: ['Original work', 'Creative portfolio'],
        nft_reward: 'Creative Genius NFT',
        xp_reward: 400,
        status: 'active',
        category: 'Arts'
      },
      {
        id: 'challenge-6',
        title: '🧠 AI Ethics Symposium Challenge',
        description: 'Research and present on AI ethics and responsible technology',
        type: 'tournament',
        difficulty: 'Advanced',
        reward: 'Ethics Scholar NFT + Conference Speaking Slot',
        participants: 89,
        max_participants: 100,
        duration: '6 weeks',
        deadline: '2025-09-15',
        requirements: ['Ethics background', 'Research skills', 'Presentation ability'],
        nft_reward: 'Ethics Scholar NFT',
        xp_reward: 800,
        status: 'upcoming',
        category: 'Ethics'
      }
    ]);

    setTournaments([
      {
        id: 'tournament-1',
        name: '🏆 Global Academic Championship 2025',
        description: 'The ultimate academic competition bringing together top students worldwide',
        participants: 2847,
        prize_pool: '$50,000',
        start_date: '2025-09-01',
        end_date: '2025-09-30',
        status: 'registration',
        categories: ['Research', 'Innovation', 'Leadership', 'Creative Arts']
      },
      {
        id: 'tournament-2',
        name: '⚡ Lightning Research Sprint',
        description: 'Fast-paced research competition with instant feedback and scoring',
        participants: 1205,
        prize_pool: '$15,000',
        start_date: '2025-08-20',
        end_date: '2025-08-22',
        status: 'active',
        categories: ['Quick Research', 'Data Analysis', 'Problem Solving']
      },
      {
        id: 'tournament-3',
        name: '🌟 Future Leaders Summit',
        description: 'Leadership challenges and networking opportunities for emerging leaders',
        participants: 456,
        prize_pool: 'Mentorship + Internship Opportunities',
        start_date: '2025-10-15',
        end_date: '2025-10-17',
        status: 'upcoming',
        categories: ['Leadership', 'Public Speaking', 'Team Management']
      }
    ]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'Advanced': return 'text-orange-600 bg-orange-100';
      case 'Expert': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'registration': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const joinChallenge = (challengeId: string) => {
    toast.success('Successfully joined challenge! Check your dashboard for updates.');
  };

  const joinTournament = (tournamentId: string) => {
    toast.success('Successfully registered for tournament! You will receive updates via email.');
  };

  if (authLoading || loading) {
    return (
      <Layout title="Challenges & Tournaments - Academic NFT Marketplace">
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
            />
            <div className="text-white text-xl font-bold mb-2">⚔️ Loading Battle Arena</div>
            <div className="text-purple-300">Preparing challenges and tournaments...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="Challenges & Tournaments - Academic NFT Marketplace">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4">
              ⚔️ Battle Arena
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              Compete in epic challenges, tournaments, and battles to earn legendary NFTs and prove your academic dominance
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-4 text-center">
                <FireIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-sm text-red-100">Active Challenges</div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-center">
                <TrophyIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-sm text-purple-100">Live Tournaments</div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 text-center">
                <UsersIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">4.2K</div>
                <div className="text-sm text-blue-100">Active Warriors</div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-center">
                <CubeIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">$75K</div>
                <div className="text-sm text-green-100">Total Rewards</div>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800 rounded-2xl p-1 flex">
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'challenges'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                ⚔️ Challenges
              </button>
              <button
                onClick={() => setActiveTab('tournaments')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'tournaments'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🏆 Tournaments
              </button>
            </div>
          </div>

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                ⚔️ Epic Challenges
                <SparklesIcon className="w-8 h-8 ml-2 text-yellow-400" />
              </h2>
              
              <div className="grid gap-6 lg:grid-cols-2">
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                          {challenge.title}
                        </h3>
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(challenge.status)}`}>
                            {challenge.status}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                            {challenge.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-center ml-4">
                        <div className="text-2xl font-bold text-orange-400">{challenge.xp_reward}</div>
                        <div className="text-xs text-gray-400">XP Reward</div>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4">{challenge.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-400">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        {challenge.participants} participants
                      </div>
                      <div className="flex items-center text-gray-400">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {challenge.duration}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">🏆 Rewards:</h4>
                      <p className="text-green-400 text-sm font-medium">{challenge.reward}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-2">📋 Requirements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {challenge.requirements.slice(0, 3).map((req, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded-full">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                      <div className="text-xs text-gray-400">
                        Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => joinChallenge(challenge.id)}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center space-x-2"
                      >
                        <BoltIcon className="w-4 h-4" />
                        <span>Join Battle</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tournaments Tab */}
          {activeTab === 'tournaments' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                🏆 Elite Tournaments
                <StarIcon className="w-8 h-8 ml-2 text-yellow-400" />
              </h2>
              
              <div className="space-y-6">
                {tournaments.map((tournament, index) => (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-8 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1 mb-6 lg:mb-0">
                        <div className="flex items-center mb-4">
                          <h3 className="text-3xl font-bold text-white mr-4">{tournament.name}</h3>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(tournament.status)}`}>
                            {tournament.status}
                          </span>
                        </div>
                        <p className="text-lg text-gray-300 mb-4">{tournament.description}</p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{tournament.participants}</div>
                            <div className="text-xs text-gray-400">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{tournament.prize_pool}</div>
                            <div className="text-xs text-gray-400">Prize Pool</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-blue-400">
                              {new Date(tournament.start_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">Start Date</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-orange-400">
                              {new Date(tournament.end_date).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">End Date</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-white mb-2">🎯 Categories:</h4>
                          <div className="flex flex-wrap gap-2">
                            {tournament.categories.map((category, idx) => (
                              <span key={idx} className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full">
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="lg:ml-8">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => joinTournament(tournament.id)}
                          className="w-full lg:w-auto px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center space-x-3 text-lg"
                        >
                          <RocketLaunchIcon className="w-6 h-6" />
                          <span>{tournament.status === 'registration' ? 'Register Now' : 'View Details'}</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-3xl p-8 border border-indigo-500/30"
          >
            <LightBulbIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Become a Legend?</h3>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              Join challenges, compete in tournaments, and earn exclusive NFTs that showcase your academic achievements to the world.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/achievements/new')}
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-2xl hover:shadow-xl transition-all flex items-center justify-center space-x-3 mx-auto text-lg"
            >
              <SparklesIcon className="w-6 h-6" />
              <span>Start Your Journey</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ChallengesPage;