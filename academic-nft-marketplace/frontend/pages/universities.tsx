import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  TrophyIcon,
  AcademicCapIcon,
  UsersIcon,
  BuildingLibraryIcon,
  StarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

interface University {
  name: string;
  code: string;
  type: string;
  location: string;
  ranking: {
    national: number;
    regional: number;
  };
  stats: {
    enrollment: number;
    acceptance_rate: number;
    avg_starting_salary: number;
  };
  comparison_with_yours: {
    prestige: string;
    research_opportunities: string;
    career_prospects: string;
  };
}

interface UniversityData {
  your_university: {
    name: string;
    your_stats: {
      current_rank: number;
      achievements_earned: number;
      nfts_minted: number;
    };
  };
  comparison_universities: University[];
  achievement_comparisons: any;
  transfer_recommendations: any[];
}

const UniversitiesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [universityData, setUniversityData] = useState<UniversityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchUniversityData();
    }
  }, [user, authLoading, router]);

  const fetchUniversityData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/universities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUniversityData(response.data);
    } catch (error) {
      console.error('Failed to fetch university data:', error);
      toast.error('Failed to load university comparison');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="University Comparison - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading university analytics...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="University Comparison - Academic NFT Marketplace">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              🏛️ University Analytics
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Compare your academic performance with top universities and discover transfer opportunities
            </p>
            
            {universityData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow p-4">
                  <AcademicCapIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">Your Rank</div>
                  <div className="text-xs text-gray-600">#{universityData.your_university.your_stats.current_rank}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <ChartBarIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">{universityData.your_university.your_stats.achievements_earned}</div>
                  <div className="text-xs text-gray-600">Achievements</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <TrophyIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">{universityData.your_university.your_stats.nfts_minted}</div>
                  <div className="text-xs text-gray-600">NFTs Minted</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <UsersIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium">{universityData.comparison_universities.length}</div>
                  <div className="text-xs text-gray-600">Universities Compared</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Your University Overview */}
          {universityData && (
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <BuildingLibraryIcon className="h-8 w-8 mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">{universityData.your_university.name}</h2>
                    <p className="opacity-90">Your Academic Home</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold">#{universityData.your_university.your_stats.current_rank}</div>
                    <div className="opacity-90">University Rank</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{universityData.your_university.your_stats.achievements_earned}</div>
                    <div className="opacity-90">Your Achievements</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{universityData.your_university.your_stats.nfts_minted}</div>
                    <div className="opacity-90">NFTs Earned</div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* University Comparisons */}
          {universityData && (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">🎓 University Comparison</h2>
                <div className="grid gap-6">
                  {universityData.comparison_universities.map((university, index) => (
                    <div key={university.code} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{university.name}</h3>
                          <p className="text-gray-600">{university.location}</p>
                          <div className="flex items-center mt-2">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-gray-600">#{university.ranking.national} National</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">#{university.ranking.national}</div>
                          <div className="text-xs text-gray-500">National Ranking</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{university.stats.enrollment.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{university.stats.acceptance_rate}%</div>
                          <div className="text-sm text-gray-600">Acceptance Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">${(university.stats.avg_starting_salary / 1000).toFixed(0)}k</div>
                          <div className="text-sm text-gray-600">Avg Starting Salary</div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Comparison with Your University:</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="text-gray-600">Prestige: {university.comparison_with_yours.prestige}</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-gray-600">Research: {university.comparison_with_yours.research_opportunities}</span>
                          </div>
                          <div className="flex items-center">
                            <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-purple-500" />
                            <span className="text-gray-600">Career: {university.comparison_with_yours.career_prospects}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UniversitiesPage;