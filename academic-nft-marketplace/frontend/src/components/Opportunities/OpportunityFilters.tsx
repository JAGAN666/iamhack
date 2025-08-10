import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  GlobeAltIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/outline';

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

interface OpportunityFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  opportunities: any[];
  loading?: boolean;
}

const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onFiltersChange,
  opportunities,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters count
  React.useEffect(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type.length > 0) count++;
    if (filters.category.length > 0) count++;
    if (filters.accessLevel.length > 0) count++;
    if (filters.location.length > 0) count++;
    if (filters.showAvailable) count++;
    if (filters.showFeatured) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const typeOptions = [
    { value: 'internship', label: 'Internships', icon: '💼' },
    { value: 'research', label: 'Research', icon: '🔬' },
    { value: 'scholarship', label: 'Scholarships', icon: '🎓' },
    { value: 'event', label: 'Events', icon: '📅' },
    { value: 'job', label: 'Jobs', icon: '💼' },
    { value: 'mentorship', label: 'Mentorship', icon: '🤝' }
  ];

  const categoryOptions = [
    { value: 'digital', label: 'Digital', icon: <GlobeAltIcon className="w-4 h-4" /> },
    { value: 'physical', label: 'Physical', icon: <MapPinIcon className="w-4 h-4" /> }
  ];

  const accessLevelOptions = [
    { value: 'accessible', label: 'Accessible to Me', icon: '🔓' },
    { value: 'need-nft', label: 'Need NFT', icon: '🎫' },
    { value: 'granted', label: 'Access Granted', icon: '✅' },
    { value: 'blocked', label: 'Blocked', icon: '🚫' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'featured', label: 'Featured First' },
    { value: 'accessible', label: 'Accessible First' }
  ];

  // Extract unique locations from opportunities
  const locationOptions = React.useMemo(() => {
    const locations = new Set<string>();
    opportunities.forEach(opp => {
      if (opp.location) {
        locations.add(opp.location);
      }
    });
    return Array.from(locations).map(location => ({ value: location, label: location }));
  }, [opportunities]);

  const updateFilters = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const updateArrayFilter = (key: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      type: [],
      category: [],
      accessLevel: [],
      location: [],
      sortBy: 'newest',
      showAvailable: false,
      showFeatured: false
    });
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder="Search opportunities, companies, or keywords..."
            value={filters.search}
            onChange={(e) => updateFilters('search', e.target.value)}
          />
          {filters.search && (
            <button
              onClick={() => updateFilters('search', '')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Toggles */}
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                checked={filters.showAvailable}
                onChange={(e) => updateFilters('showAvailable', e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700">Available Only</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-yellow-600 shadow-sm focus:border-yellow-300 focus:ring focus:ring-yellow-200 focus:ring-opacity-50"
                checked={filters.showFeatured}
                onChange={(e) => updateFilters('showFeatured', e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                Featured
              </span>
            </label>

            {/* Sort Dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilters('sortBy', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-100"
          >
            <div className="p-6 space-y-6">
              
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Opportunity Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {typeOptions.map(option => (
                    <label key={option.value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        checked={filters.type.includes(option.value)}
                        onChange={(e) => updateArrayFilter('type', option.value, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        <span className="mr-1">{option.icon}</span>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="flex gap-4">
                  {categoryOptions.map(option => (
                    <label key={option.value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        checked={filters.category.includes(option.value)}
                        onChange={(e) => updateArrayFilter('category', option.value, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        {option.icon}
                        <span className="ml-1 capitalize">{option.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Access Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Access Level
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {accessLevelOptions.map(option => (
                    <label key={option.value} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        checked={filters.accessLevel.includes(option.value)}
                        onChange={(e) => updateArrayFilter('accessLevel', option.value, e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        <span className="mr-1">{option.icon}</span>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              {locationOptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Location
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-32 overflow-y-auto">
                    {locationOptions.map(option => (
                      <label key={option.value} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                          checked={filters.location.includes(option.value)}
                          onChange={(e) => updateArrayFilter('location', option.value, e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Loading opportunities...
              </span>
            ) : (
              `${opportunities.length} opportunit${opportunities.length === 1 ? 'y' : 'ies'} found`
            )}
          </span>
          
          {activeFiltersCount > 0 && (
            <span className="text-indigo-600">
              {activeFiltersCount} filter{activeFiltersCount === 1 ? '' : 's'} applied
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityFilters;