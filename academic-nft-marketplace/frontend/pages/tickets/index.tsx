import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Layout from '../../src/components/Layout/Layout';
import { CalendarIcon, MapPinIcon, UserGroupIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  image: string;
  nftDiscounts: {
    gpa_guardian: number;
    research_rockstar: number;
    leadership_legend: number;
  };
  tags: string[];
}

// Sample events data
const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Future of Academic Research Conference',
    description: 'Join leading researchers and academics to explore cutting-edge developments in academic research methodologies and emerging technologies.',
    date: '2025-09-15',
    time: '9:00 AM - 5:00 PM',
    location: 'Harvard University, Cambridge, MA',
    price: 75,
    maxAttendees: 500,
    currentAttendees: 342,
    image: '/api/placeholder/400/250',
    nftDiscounts: {
      gpa_guardian: 20,
      research_rockstar: 100,
      leadership_legend: 30
    },
    tags: ['Research', 'Academic', 'Technology']
  },
  {
    id: '2',
    title: 'Student Leadership Summit 2025',
    description: 'Develop your leadership skills with workshops, networking sessions, and talks from successful student leaders across universities.',
    date: '2025-08-22',
    time: '10:00 AM - 6:00 PM',
    location: 'Stanford University, Palo Alto, CA',
    price: 45,
    maxAttendees: 300,
    currentAttendees: 178,
    image: '/api/placeholder/400/250',
    nftDiscounts: {
      gpa_guardian: 15,
      research_rockstar: 20,
      leadership_legend: 100
    },
    tags: ['Leadership', 'Networking', 'Development']
  },
  {
    id: '3',
    title: 'Cross-University Networking Night',
    description: 'Connect with students, alumni, and professionals from partner universities. Perfect for building your academic and professional network.',
    date: '2025-08-30',
    time: '6:00 PM - 9:00 PM',
    location: 'MIT Campus, Boston, MA',
    price: 25,
    maxAttendees: 200,
    currentAttendees: 89,
    image: '/api/placeholder/400/250',
    nftDiscounts: {
      gpa_guardian: 20,
      research_rockstar: 30,
      leadership_legend: 40
    },
    tags: ['Networking', 'Social', 'Career']
  },
  {
    id: '4',
    title: 'Graduate School Application Workshop',
    description: 'Get expert guidance on graduate school applications, personal statements, and interview preparation from admissions counselors.',
    date: '2025-09-05',
    time: '2:00 PM - 5:00 PM',
    location: 'Eastern Michigan University, Ypsilanti, MI',
    price: 20,
    maxAttendees: 150,
    currentAttendees: 67,
    image: '/api/placeholder/400/250',
    nftDiscounts: {
      gpa_guardian: 25,
      research_rockstar: 15,
      leadership_legend: 10
    },
    tags: ['Graduate School', 'Workshop', 'Career']
  }
];

const TicketsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to sample data if API fails
      setEvents(sampleEvents);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.tags.some(tag => tag.toLowerCase().includes(filter.toLowerCase())));

  const getNFTDiscount = (event: Event, nftType: string) => {
    switch(nftType) {
      case 'gpa_guardian': return event.nftDiscounts.gpa_guardian;
      case 'research_rockstar': return event.nftDiscounts.research_rockstar;
      case 'leadership_legend': return event.nftDiscounts.leadership_legend;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Layout title="Events & Tickets - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading upcoming events...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Events & Tickets - Academic NFT Marketplace">
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Exclusive Academic Events
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                Get exclusive access to conferences, workshops, and networking events. 
                Your NFT achievements unlock special discounts and VIP access!
              </p>
              <div className="flex items-center justify-center space-x-4 text-yellow-300">
                <SparklesIcon className="w-6 h-6" />
                <span className="font-medium">NFT holders get up to 100% discount!</span>
                <SparklesIcon className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {['all', 'research', 'leadership', 'networking', 'career', 'workshop'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-50'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-4xl">🎓</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-wrap gap-1">
                      {event.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {event.currentAttendees}/{event.maxAttendees} attending
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()} • {event.time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  </div>

                  {/* NFT Discounts */}
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-xs font-medium text-purple-700 mb-2">NFT Holder Benefits:</div>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div className="text-center">
                        <div className="text-blue-600 font-medium">🎓 GPA</div>
                        <div>{event.nftDiscounts.gpa_guardian}% off</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 font-medium">🔬 Research</div>
                        <div>{event.nftDiscounts.research_rockstar === 100 ? 'FREE' : `${event.nftDiscounts.research_rockstar}% off`}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-600 font-medium">👑 Leader</div>
                        <div>{event.nftDiscounts.leadership_legend === 100 ? 'VIP' : `${event.nftDiscounts.leadership_legend}% off`}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${event.price}</span>
                      <span className="text-sm text-gray-500 ml-1">per ticket</span>
                    </div>
                    <Link
                      href={`/tickets/${event.id}`}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transition-shadow"
                    >
                      Get Tickets
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No events message */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your filter to see more events.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TicketsPage;