import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
  FireIcon,
  HandRaisedIcon,
  CalendarIcon,
  UserGroupIcon,
  BookOpenIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SocialData {
  profile: {
    social_score: number;
    connections: number;
    followers: number;
    following: number;
    influence_rank: string;
    networking_level: number;
    social_nfts: number;
    collaboration_score: number;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    timestamp: string;
    user: {
      name: string;
      avatar: string;
      university: string;
    };
    content: string;
    reactions: {
      [key: string]: number;
    };
    comments: number;
    shares?: number;
  }>;
  connections: Array<{
    id: string;
    name: string;
    title: string;
    university: string;
    avatar: string;
    connection_strength: number;
    shared_interests?: string[];
    available_for?: string[];
    nft_collection_overlap: number;
    mutual_connections: number;
  }>;
  study_groups: Array<{
    id: string;
    name: string;
    university: string;
    members: number;
    focus: string;
    meeting_schedule: string;
    next_topic: string;
    your_role: string;
    access_level: string;
    achievements_earned: number;
  }>;
  networking_events: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    format: string;
    attendees: number;
    universities: string[];
    your_status: string;
    access_level: string;
    benefits?: string[];
    cost: string;
  }>;
  recommendations?: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
  }>;
}

const SocialPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [socialData, setSocialData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchSocialData();
    }
  }, [user, authLoading, router]);

  const fetchSocialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/social', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocialData(response.data);
    } catch (error) {
      console.error('Failed to fetch social data:', error);
      toast.error('Failed to load social features');
    } finally {
      setLoading(false);
    }
  };

  const handleReaction = (activityId: string, reactionType: string) => {
    toast.success(`Added ${reactionType} reaction!`);
  };

  const connectWithUser = (connectionId: string) => {
    toast.success('Connection request sent!');
  };

  const joinStudyGroup = (groupId: string) => {
    toast.success('Successfully joined study group!');
  };

  const registerForEvent = (eventId: string) => {
    toast.success('Successfully registered for networking event!');
  };

  if (authLoading || loading) {
    return (
      <Layout title="Social Network - Academic NFT Marketplace">
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"
            />
            <div className="text-white text-xl font-bold mb-2">🌐 Loading Social Nexus</div>
            <div className="text-purple-300">Connecting academic networks...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !socialData) return null;

  return (
    <Layout title="Social Network - Academic NFT Marketplace">
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              🌐 Social Nexus
            </h1>
            <p className="text-xl text-gray-300 mb-6 max-w-4xl mx-auto">
              Connect with fellow academics, collaborate on projects, and expand your professional network
            </p>
            
            {/* Social Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 text-center">
                <UsersIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{socialData.profile.connections}</div>
                <div className="text-sm text-blue-100">Connections</div>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-center">
                <StarIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{socialData.profile.social_score}</div>
                <div className="text-sm text-purple-100">Social Score</div>
              </div>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-center">
                <TrophyIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Lv.{socialData.profile.networking_level}</div>
                <div className="text-sm text-green-100">Network Level</div>
              </div>
              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl p-4 text-center">
                <FireIcon className="h-8 w-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{socialData.profile.influence_rank?.split(' ')[0] || 'New'}</div>
                <div className="text-sm text-yellow-100">Influence</div>
              </div>
            </div>

            {/* Rank Display */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-4 border border-purple-500/30 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <SparklesIcon className="w-6 h-6 text-yellow-400" />
                <span className="text-lg font-bold text-white">{socialData.profile.influence_rank}</span>
                <SparklesIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="bg-gray-800 rounded-2xl p-1 flex space-x-1 min-w-max">
              {[
                { id: 'feed', label: '📰 Activity Feed', icon: ChatBubbleLeftRightIcon },
                { id: 'connections', label: '👥 Network', icon: UsersIcon },
                { id: 'study-groups', label: '📚 Study Groups', icon: BookOpenIcon },
                { id: 'events', label: '📅 Events', icon: CalendarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Feed Tab */}
          {activeTab === 'feed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              {socialData.recent_activity && socialData.recent_activity.length > 0 ? (
                socialData.recent_activity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-white font-semibold">{activity.user.name}</h4>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-purple-400 text-sm">{activity.user.university}</span>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-400 text-sm">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 mb-4">{activity.content}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            {activity.reactions && Object.entries(activity.reactions).map(([reaction, count]) => (
                              <button
                                key={reaction}
                                onClick={() => handleReaction(activity.id, reaction)}
                                className="flex items-center space-x-1 text-gray-400 hover:text-purple-400 transition-colors"
                              >
                                {reaction === 'likes' && <HeartIcon className="w-5 h-5" />}
                                {reaction === 'fire' && <FireIcon className="w-5 h-5" />}
                                {reaction === 'congratulations' && <HandRaisedIcon className="w-5 h-5" />}
                                <span className="text-sm">{count}</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors">
                              <ChatBubbleLeftRightIcon className="w-5 h-5" />
                              <span className="text-sm">{activity.comments}</span>
                            </button>
                            {activity.shares && (
                              <button className="flex items-center space-x-1 text-gray-400 hover:text-green-400 transition-colors">
                                <ShareIcon className="w-5 h-5" />
                                <span className="text-sm">{activity.shares}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Activity Yet</h3>
                  <p className="text-gray-400">Start connecting with other students to see activity in your feed!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Network Tab */}
          {activeTab === 'connections' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {socialData.connections && socialData.connections.length > 0 ? (
                socialData.connections.map((connection, index) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                        {connection.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{connection.name}</h3>
                      <p className="text-blue-400 text-sm mb-1">{connection.title}</p>
                      <p className="text-gray-400 text-xs">{connection.university}</p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Connection Strength</span>
                        <span className="text-green-400 font-semibold">{connection.connection_strength}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${connection.connection_strength}%` }}
                        ></div>
                      </div>
                    </div>

                    {connection.shared_interests && connection.shared_interests.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Shared Interests:</h4>
                        <div className="flex flex-wrap gap-2">
                          {connection.shared_interests.slice(0, 3).map((interest, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">{connection.nft_collection_overlap}</div>
                        <div className="text-gray-400">Shared NFTs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{connection.mutual_connections}</div>
                        <div className="text-gray-400">Mutual Connections</div>
                      </div>
                    </div>

                    <button
                      onClick={() => connectWithUser(connection.id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Connect
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 col-span-full">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Connections Yet</h3>
                  <p className="text-gray-400">Start building your academic network by connecting with fellow students!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Study Groups Tab */}
          {activeTab === 'study-groups' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {socialData.study_groups && socialData.study_groups.length > 0 ? (
                socialData.study_groups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-indigo-500/30"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-center mb-3">
                          <BookOpenIcon className="w-8 h-8 text-indigo-400 mr-3" />
                          <div>
                            <h3 className="text-xl font-bold text-white">{group.name}</h3>
                            <p className="text-indigo-400 text-sm">{group.university} • {group.members} members</p>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-3">{group.focus}</p>
                        <div className="text-sm text-gray-300">
                          <strong>Next Topic:</strong> {group.next_topic}
                        </div>
                      </div>
                      <div className="lg:ml-6">
                        <button
                          onClick={() => joinStudyGroup(group.id)}
                          className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                          <UserGroupIcon className="w-5 h-5" />
                          <span>Join Group</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Study Groups Yet</h3>
                  <p className="text-gray-400">Join study groups to collaborate and learn with peers!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {socialData.networking_events && socialData.networking_events.length > 0 ? (
                socialData.networking_events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-green-900/50 to-teal-900/50 rounded-2xl p-6 border border-green-500/30"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1 mb-4 lg:mb-0">
                        <div className="flex items-center mb-4">
                          <CalendarIcon className="w-8 h-8 text-green-400 mr-3" />
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-300">
                              <span>{event.date} • {event.time}</span>
                              <span>{event.format}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-400">{event.attendees}</div>
                            <div className="text-xs text-gray-400">Attendees</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-400">{event.universities.length}</div>
                            <div className="text-xs text-gray-400">Universities</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-purple-400">{event.your_status}</div>
                            <div className="text-xs text-gray-400">Status</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-400">{event.cost}</div>
                            <div className="text-xs text-gray-400">Cost</div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:ml-6">
                        <button
                          onClick={() => registerForEvent(event.id)}
                          className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                          <RocketLaunchIcon className="w-5 h-5" />
                          <span>Register</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Events Available</h3>
                  <p className="text-gray-400">Check back later for exciting networking events and workshops!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Recommendations Panel */}
          {socialData.recommendations && socialData.recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl p-6 border border-purple-500/30"
            >
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <SparklesIcon className="w-8 h-8 text-yellow-400 mr-3" />
                Personalized Recommendations
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {socialData.recommendations.map((rec, index) => (
                  <div key={index} className="bg-black/20 rounded-2xl p-4 border border-purple-400/20">
                    <div className="flex items-center mb-3">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        rec.priority === 'High' ? 'bg-red-500' : 
                        rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <h4 className="text-white font-semibold text-sm">{rec.title}</h4>
                    </div>
                    <p className="text-gray-300 text-sm">{rec.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SocialPage;