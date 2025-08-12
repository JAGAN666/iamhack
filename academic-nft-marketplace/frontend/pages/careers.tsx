import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  BriefcaseIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';

interface CareerPath {
  id: string;
  title: string;
  match_percentage: number;
  salary_range: string;
  growth_potential: string;
  demand_level: string;
  description: string;
  key_skills: string[];
  companies: string[];
  next_steps: string[];
  timeline: string;
}

interface CareerData {
  career_insights: {
    recommended_paths: CareerPath[];
    skill_gaps: any[];
  };
  industry_trends: any[];
  market_analysis: any;
  personalized_recommendations: any[];
}

const CareersPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCareerData();
    }
  }, [user, authLoading, router]);

  const fetchCareerData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/careers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCareerData(response.data);
    } catch (error) {
      console.error('Failed to fetch career data:', error);
      toast.error('Failed to load career insights');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="AI Career Matchmaking - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading career matchmaking...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout title="AI Career Matchmaking - Academic NFT Marketplace">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              🤖 AI Career Matchmaking
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered career recommendations based on your achievements and NFT collection
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow p-4">
                <SparklesIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <div className="text-sm font-medium">AI-Powered</div>
                <div className="text-xs text-gray-600">Smart Matching</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <BriefcaseIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">
                  {careerData?.career_insights.recommended_paths.length || 0}
                </div>
                <div className="text-xs text-gray-600">Matched Careers</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Real-time</div>
                <div className="text-xs text-gray-600">Market Analysis</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <AcademicCapIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Skill Gap</div>
                <div className="text-xs text-gray-600">Analysis</div>
              </div>
            </div>
          </motion.div>

          {/* Career Recommendations */}
          {careerData && (
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">🎯 Your Career Matches</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {careerData.career_insights.recommended_paths.map((career, index) => (
                    <div key={career.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{career.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              {career.salary_range}
                            </div>
                            <div className="flex items-center">
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                              {career.growth_potential}
                            </div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{career.match_percentage}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{career.description}</p>
                      
                      {career.key_skills && career.key_skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {career.key_skills.slice(0, 4).map((skill) => (
                              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {career.companies && career.companies.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Top Companies:</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {career.companies.slice(0, 3).map((company) => (
                              <div key={company} className="flex items-center">
                                <BuildingOffice2Icon className="h-4 w-4 mr-1" />
                                {company}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {career.next_steps && career.next_steps.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Next Steps:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {career.next_steps.slice(0, 2).map((step, idx) => (
                              <li key={idx} className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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

export default CareersPage;