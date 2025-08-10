import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LockClosedIcon,
  LockOpenIcon,
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ClockIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface OpportunityCardProps {
  opportunity: {
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
  };
  onRequestAccess?: (opportunityId: string) => Promise<void>;
  isRequesting?: boolean;
  userNFTs?: string[];
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onRequestAccess,
  isRequesting = false,
  userNFTs = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return <BuildingOfficeIcon className="w-5 h-5" />;
      case 'research':
        return <AcademicCapIcon className="w-5 h-5" />;
      case 'scholarship':
        return <SparklesIcon className="w-5 h-5" />;
      case 'event':
        return <CalendarIcon className="w-5 h-5" />;
      default:
        return <StarIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'internship':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'research':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'scholarship':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'event':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNFTBadgeColor = (nftType: string) => {
    switch (nftType.toLowerCase()) {
      case 'gpa_guardian':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'research_rockstar':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'leadership_legend':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const hasRequiredNFT = opportunity.requiredNFTs.some(nft => userNFTs.includes(nft));
  const accessibilityStatus = opportunity.accessible !== false ? 
    (hasRequiredNFT ? 'accessible' : 'no-nft') : 
    'blocked';

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRequestAccess = async () => {
    if (onRequestAccess) {
      try {
        await onRequestAccess(opportunity.id);
        toast.success('Access requested successfully!');
      } catch (error) {
        toast.error('Failed to request access');
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 overflow-hidden ${
        opportunity.featured ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Featured/Urgent badges */}
      {(opportunity.featured || opportunity.urgent) && (
        <div className="absolute top-0 right-0 z-10">
          {opportunity.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center">
              <StarIcon className="w-3 h-3 mr-1" />
              FEATURED
            </div>
          )}
          {opportunity.urgent && (
            <div className="bg-gradient-to-r from-red-400 to-red-500 text-white px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center mt-8">
              <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
              URGENT
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(opportunity.type)}`}>
                {getTypeIcon(opportunity.type)}
                <span className="ml-1 capitalize">{opportunity.type}</span>
              </div>
              
              {opportunity.category === 'digital' ? (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  <GlobeAltIcon className="w-3 h-3 mr-1" />
                  Digital
                </div>
              ) : (
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  Physical
                </div>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {opportunity.title}
            </h3>

            {opportunity.company && (
              <p className="text-sm text-gray-600 mb-2 flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-1" />
                {opportunity.company}
              </p>
            )}
          </div>

          {/* Access Status */}
          <div className="ml-4 flex flex-col items-end">
            {accessibilityStatus === 'accessible' ? (
              <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <LockOpenIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Accessible</span>
              </div>
            ) : accessibilityStatus === 'no-nft' ? (
              <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                <LockClosedIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">NFT Required</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Blocked</span>
              </div>
            )}

            {opportunity.hasAccess && (
              <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">Access Granted</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {opportunity.description}
        </p>

        {/* Required NFTs */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Required NFTs:</p>
          <div className="flex flex-wrap gap-2">
            {opportunity.requiredNFTs.map((nft) => (
              <div
                key={nft}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getNFTBadgeColor(nft)} ${
                  userNFTs.includes(nft) ? 'ring-2 ring-green-300' : ''
                }`}
              >
                {userNFTs.includes(nft) && <CheckCircleIcon className="w-3 h-3 mr-1 text-green-600" />}
                <span className="capitalize">{nft.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
          {opportunity.location && (
            <div className="flex items-center">
              <MapPinIcon className="w-4 h-4 mr-1" />
              {opportunity.location}
            </div>
          )}
          
          {opportunity.startDate && (
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {formatDate(opportunity.startDate)}
            </div>
          )}
          
          {opportunity.maxParticipants && (
            <div className="flex items-center">
              <UserGroupIcon className="w-4 h-4 mr-1" />
              {opportunity.currentParticipants || 0}/{opportunity.maxParticipants}
            </div>
          )}
          
          {opportunity.salary && (
            <div className="flex items-center font-medium text-green-600">
              💰 {opportunity.salary}
            </div>
          )}
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 pt-4 mt-4"
            >
              <div className="space-y-3">
                {opportunity.endDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    <span>Ends: {formatDate(opportunity.endDate)}</span>
                  </div>
                )}
                
                {opportunity.accessReason && accessibilityStatus !== 'accessible' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Access Status:</strong> {opportunity.accessReason}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>

          <div className="flex items-center gap-2">
            {opportunity.hasAccess && opportunity.url ? (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={opportunity.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <LockOpenIcon className="w-4 h-4 mr-2" />
                Access Now
              </motion.a>
            ) : accessibilityStatus === 'accessible' && !opportunity.hasAccess ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRequestAccess}
                disabled={isRequesting}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRequesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Requesting...
                  </>
                ) : (
                  <>
                    <LockOpenIcon className="w-4 h-4 mr-2" />
                    Request Access
                  </>
                )}
              </motion.button>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed">
                <LockClosedIcon className="w-4 h-4 mr-2" />
                Unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OpportunityCard;