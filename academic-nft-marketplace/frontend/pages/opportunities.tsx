import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../src/components/Layout/Layout';
import OpportunityCard from '../src/components/Opportunities/OpportunityCard';
import OpportunityFilters from '../src/components/Opportunities/OpportunityFilters';
import { opportunityAPI } from '../src/lib/api';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlusIcon,
  Squares2X2Icon,
  QueueListIcon
} from '@heroicons/react/24/outline';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: string;
  category: 'digital' | 'physical';
  requiredNFTs: string[];
  hasAccess: boolean;
  accessible?: boolean;
  accessReason?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  url?: string;
  salary?: string;
  featured?: boolean;
  urgent?: boolean;
}

interface FilterState {
  search: string;
  type: string[];
  category: string[];
  accessLevel: string[];
  location: string[];
  sortBy: string;
  showAvailable: boolean;
  showFeatured: boolean;
}

const OpportunitiesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingAccess, setRequestingAccess] = useState<string | null>(null);
  const [userNFTs, setUserNFTs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: [],
    category: [],
    accessLevel: [],
    location: [],
    sortBy: 'newest',
    showAvailable: false,
    showFeatured: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.emailVerified) {
      fetchOpportunities();
      fetchUserNFTs();
    }
  }, [user, authLoading, router]);

  const fetchOpportunities = async () => {
    try {
      const response = await opportunityAPI.getAll();
      // Enhance opportunities with accessibility check
      const enhancedOpportunities = response.data.map((opp: Opportunity) => ({
        ...opp,
        featured: Math.random() > 0.8, // Demo: randomly make some featured
        urgent: Math.random() > 0.9, // Demo: randomly make some urgent
        currentParticipants: Math.floor(Math.random() * (opp.maxParticipants || 100)),
      }));
      setOpportunities(enhancedOpportunities);
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNFTs = async () => {
    try {
      // This would typically fetch from NFT API
      // For demo, we'll simulate some NFTs
      setUserNFTs(['gpa_guardian', 'research_rockstar']);
    } catch (error) {
      console.error('Failed to fetch user NFTs:', error);
    }
  };

  const handleRequestAccess = async (opportunityId: string) => {
    setRequestingAccess(opportunityId);
    try {
      await opportunityAPI.requestAccess(opportunityId);
      toast.success('Access granted! You can now use this opportunity.');
      fetchOpportunities(); // Refresh to update access status
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to request access');
    } finally {
      setRequestingAccess(null);
    }
  };

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = [...opportunities];

    // Text search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchLower) ||
        opp.description.toLowerCase().includes(searchLower) ||
        opp.company?.toLowerCase().includes(searchLower) ||
        opp.location?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(opp => filters.type.includes(opp.type));
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(opp => filters.category.includes(opp.category));
    }

    // Location filter
    if (filters.location.length > 0) {
      filtered = filtered.filter(opp => opp.location && filters.location.includes(opp.location));
    }

    // Access level filter
    if (filters.accessLevel.length > 0) {
      filtered = filtered.filter(opp => {
        const hasRequiredNFT = opp.requiredNFTs.some(nft => userNFTs.includes(nft));
        
        if (filters.accessLevel.includes('accessible') && hasRequiredNFT && !opp.hasAccess) return true;
        if (filters.accessLevel.includes('granted') && opp.hasAccess) return true;
        if (filters.accessLevel.includes('need-nft') && !hasRequiredNFT) return true;
        if (filters.accessLevel.includes('blocked') && opp.accessible === false) return true;
        
        return filters.accessLevel.length === 0;
      });
    }

    // Show available only
    if (filters.showAvailable) {
      filtered = filtered.filter(opp => {
        const hasRequiredNFT = opp.requiredNFTs.some(nft => userNFTs.includes(nft));
        return hasRequiredNFT && opp.accessible !== false;
      });
    }

    // Show featured only
    if (filters.showFeatured) {
      filtered = filtered.filter(opp => opp.featured);
    }

    // Sort
    switch (filters.sortBy) {
      case 'featured':
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      case 'deadline':
        filtered.sort((a, b) => {
          const aDate = a.endDate ? new Date(a.endDate).getTime() : Infinity;
          const bDate = b.endDate ? new Date(b.endDate).getTime() : Infinity;
          return aDate - bDate;
        });
        break;
      case 'accessible':
        filtered.sort((a, b) => {
          const aAccessible = a.requiredNFTs.some(nft => userNFTs.includes(nft));
          const bAccessible = b.requiredNFTs.some(nft => userNFTs.includes(nft));
          return (bAccessible ? 1 : 0) - (aAccessible ? 1 : 0);
        });
        break;
      case 'popular':
        filtered.sort((a, b) => (b.currentParticipants || 0) - (a.currentParticipants || 0));
        break;
      default: // newest
        filtered.sort((a, b) => b.id.localeCompare(a.id));
    }

    return filtered;
  }, [opportunities, filters, userNFTs]);

  if (authLoading || loading) {
    return (
      <Layout title="Opportunities - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user?.emailVerified) {
    return (
      <Layout title="Opportunities - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h1>
            <p className="text-gray-600">Please verify your university email to access opportunities.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Opportunities - Academic NFT Marketplace">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Exclusive Opportunities
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Unlock premium resources and experiences with your achievement NFTs
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <SparklesIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Opportunities</p>
                    <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <InformationCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Accessible</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredOpportunities.filter(opp => 
                        opp.requiredNFTs.some(nft => userNFTs.includes(nft))
                      ).length}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <ExclamationTriangleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">My NFTs</p>
                    <p className="text-2xl font-bold text-gray-900">{userNFTs.length}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
              >
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <SparklesIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Featured</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {opportunities.filter(opp => opp.featured).length}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <OpportunityFilters
              filters={filters}
              onFiltersChange={setFilters}
              opportunities={opportunities}
              loading={loading}
            />
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {filteredOpportunities.length} result{filteredOpportunities.length !== 1 ? 's' : ''}
              </span>
              {filters.search && (
                <span className="text-sm text-gray-500">
                  for "{filters.search}"
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <QueueListIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* Opportunities Grid/List */}
          <AnimatePresence mode="wait">
            {filteredOpportunities.length > 0 ? (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={
                  viewMode === 'grid'
                    ? "grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4"
                }
              >
                {filteredOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onRequestAccess={handleRequestAccess}
                    isRequesting={requestingAccess === opportunity.id}
                    userNFTs={userNFTs}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No opportunities found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {filters.search || filters.type.length > 0 || filters.category.length > 0
                      ? "Try adjusting your filters to find more opportunities."
                      : "Check back soon for new exclusive opportunities, or upload achievements to unlock access."
                    }
                  </p>
                  <div className="flex justify-center space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilters({
                        search: '',
                        type: [],
                        category: [],
                        accessLevel: [],
                        location: [],
                        sortBy: 'newest',
                        showAvailable: false,
                        showFeatured: false
                      })}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Clear Filters
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push('/achievements/new')}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Upload Achievement
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default OpportunitiesPage;