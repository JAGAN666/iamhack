import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../../src/components/Layout/Layout';
import { CalendarIcon, MapPinIcon, UserGroupIcon, ClockIcon, StarIcon, TicketIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../src/contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
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
  organizer: string;
  agenda: string[];
  speakers: string[];
}

// Sample event data (in real app, this would come from API)
const sampleEvents = {
  '1': {
    id: '1',
    title: 'Future of Academic Research Conference',
    description: 'Join leading researchers and academics to explore cutting-edge developments in academic research methodologies and emerging technologies.',
    fullDescription: 'This comprehensive conference brings together the brightest minds in academia to discuss the future of research. Over the course of a full day, participants will engage with cutting-edge research methodologies, emerging technologies, and innovative approaches to academic inquiry. The event features keynote presentations, interactive workshops, and networking sessions designed to foster collaboration and knowledge sharing across disciplines.',
    date: '2025-09-15',
    time: '9:00 AM - 5:00 PM',
    location: 'Harvard University, Cambridge, MA',
    price: 75,
    maxAttendees: 500,
    currentAttendees: 342,
    image: '/api/placeholder/600/400',
    nftDiscounts: {
      gpa_guardian: 20,
      research_rockstar: 100,
      leadership_legend: 30
    },
    tags: ['Research', 'Academic', 'Technology'],
    organizer: 'Harvard Research Institute',
    agenda: [
      '9:00 AM - Registration & Coffee',
      '9:30 AM - Opening Keynote: The Future of AI in Research',
      '10:30 AM - Panel: Cross-Disciplinary Collaboration',
      '12:00 PM - Networking Lunch',
      '1:30 PM - Workshop: Modern Research Methodologies',
      '3:00 PM - Poster Session',
      '4:00 PM - Closing Remarks & Next Steps'
    ],
    speakers: [
      'Dr. Sarah Chen - MIT AI Research Lab',
      'Prof. Michael Johnson - Harvard Medical School',
      'Dr. Lisa Rodriguez - Stanford Engineering',
      'Prof. David Kim - University of California'
    ]
  }
  // Add other events as needed
};

const EventDetailsPage: React.FC = () => {
  const router = useRouter();
  const { eventId } = router.query;
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [userNFTs, setUserNFTs] = useState<string[]>(['gpa_guardian', 'research_rockstar']); // Demo NFTs

  useEffect(() => {
    if (eventId) {
      // Simulate API call
      setTimeout(() => {
        const eventData = sampleEvents[eventId as string];
        if (eventData) {
          setEvent(eventData);
        }
        setLoading(false);
      }, 500);
    }
  }, [eventId]);

  if (loading) {
    return (
      <Layout title="Event Details - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout title="Event Not Found - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Not Found</h1>
            <p className="text-gray-600 mb-8">The event you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/tickets')}
              className="btn-primary"
            >
              Browse All Events
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const getBestDiscount = () => {
    let bestDiscount = 0;
    let bestNFT = '';

    userNFTs.forEach(nft => {
      const discount = event.nftDiscounts[nft as keyof typeof event.nftDiscounts];
      if (discount > bestDiscount) {
        bestDiscount = discount;
        bestNFT = nft;
      }
    });

    return { discount: bestDiscount, nft: bestNFT };
  };

  const { discount, nft } = getBestDiscount();
  const discountedPrice = discount === 100 ? 0 : event.price * (1 - discount / 100);
  const totalPrice = discountedPrice * ticketQuantity;

  const handlePurchase = () => {
    // In a real app, this would integrate with Stripe or similar payment processor
    alert(`Purchase ${ticketQuantity} ticket(s) for $${totalPrice.toFixed(2)}\n\n${discount > 0 ? `Applied ${discount}% NFT discount!` : ''}`);
  };

  return (
    <Layout title={`${event.title} - Academic NFT Marketplace`}>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <motion.div 
              className="text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {event.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{event.title}</h1>
              <p className="text-xl text-gray-200 max-w-3xl">{event.description}</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Details */}
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Event</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{event.fullDescription}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Date & Time</div>
                      <div className="text-gray-600">{new Date(event.date).toLocaleDateString()}</div>
                      <div className="text-gray-600">{event.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Location</div>
                      <div className="text-gray-600">{event.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <UserGroupIcon className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Capacity</div>
                      <div className="text-gray-600">{event.currentAttendees}/{event.maxAttendees} registered</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <StarIcon className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">Organizer</div>
                      <div className="text-gray-600">{event.organizer}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Agenda */}
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Agenda</h2>
                <div className="space-y-4">
                  {event.agenda.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Speakers */}
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Speakers</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {event.speakers.map((speaker, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {speaker.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-700 font-medium">{speaker}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Ticket Purchase Sidebar */}
            <div className="lg:col-span-1">
              <motion.div 
                className="sticky top-8 bg-white rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get Your Tickets</h3>
                
                {/* NFT Discount Display */}
                {discount > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">NFT Holder Discount</span>
                      <span className="text-lg font-bold text-purple-700">{discount}% OFF</span>
                    </div>
                    <div className="text-xs text-purple-600">
                      {nft === 'gpa_guardian' && '🎓 GPA Guardian NFT'}
                      {nft === 'research_rockstar' && '🔬 Research Rockstar NFT'}
                      {nft === 'leadership_legend' && '👑 Leadership Legend NFT'}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Tickets
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        disabled={ticketQuantity <= 1}
                      >
                        -
                      </button>
                      <span className="text-xl font-semibold w-12 text-center">{ticketQuantity}</span>
                      <button
                        onClick={() => setTicketQuantity(Math.min(5, ticketQuantity + 1))}
                        className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        disabled={ticketQuantity >= 5}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg mb-2">
                      <span>Ticket Price:</span>
                      <span>${event.price.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 mb-2">
                        <span>NFT Discount ({discount}%):</span>
                        <span>-${((event.price * discount / 100) * ticketQuantity).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Quantity:</span>
                      <span>×{ticketQuantity}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-2xl font-bold">
                      <span>Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePurchase}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                    disabled={event.currentAttendees >= event.maxAttendees}
                  >
                    <TicketIcon className="w-5 h-5" />
                    <span>
                      {event.currentAttendees >= event.maxAttendees ? 'Sold Out' : 'Purchase Tickets'}
                    </span>
                  </button>

                  {event.currentAttendees >= event.maxAttendees && (
                    <div className="text-center text-red-600 text-sm">
                      This event is sold out. Join our waitlist to be notified if tickets become available.
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailsPage;