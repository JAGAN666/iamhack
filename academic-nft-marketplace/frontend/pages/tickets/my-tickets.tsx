import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../src/components/Layout/Layout';
import { useAuth } from '../../src/contexts/AuthContext';
import { CalendarIcon, MapPinIcon, QrCodeIcon, TicketIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface UserTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  purchaseDate: string;
  pricePaid: number;
  qrCode: string;
  status: 'active' | 'used' | 'expired';
  nftDiscountApplied?: string;
  ticketNumber: string;
}

// Sample user tickets
const sampleTickets: UserTicket[] = [
  {
    id: 'ticket-1',
    eventId: '1',
    eventTitle: 'Future of Academic Research Conference',
    eventDate: '2025-09-15',
    eventTime: '9:00 AM - 5:00 PM',
    eventLocation: 'Harvard University, Cambridge, MA',
    purchaseDate: '2025-08-05',
    pricePaid: 0,
    qrCode: 'ACAD-NFT-RESEARCH-2025-001',
    status: 'active',
    nftDiscountApplied: 'research_rockstar',
    ticketNumber: 'ANM-2025-001'
  },
  {
    id: 'ticket-2',
    eventId: '2',
    eventTitle: 'Student Leadership Summit 2025',
    eventDate: '2025-08-22',
    eventTime: '10:00 AM - 6:00 PM',
    eventLocation: 'Stanford University, Palo Alto, CA',
    purchaseDate: '2025-08-01',
    pricePaid: 45,
    qrCode: 'ACAD-NFT-LEADERSHIP-2025-002',
    status: 'active',
    ticketNumber: 'ANM-2025-002'
  },
  {
    id: 'ticket-3',
    eventId: '3',
    eventTitle: 'Cross-University Networking Night',
    eventDate: '2025-07-20',
    eventTime: '6:00 PM - 9:00 PM',
    eventLocation: 'MIT Campus, Boston, MA',
    purchaseDate: '2025-07-10',
    pricePaid: 15,
    qrCode: 'ACAD-NFT-NETWORK-2025-003',
    status: 'used',
    nftDiscountApplied: 'leadership_legend',
    ticketNumber: 'ANM-2025-003'
  }
];

const MyTicketsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate API call
      setTimeout(() => {
        setTickets(sampleTickets);
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'used': return 'text-gray-700 bg-gray-100';
      case 'expired': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getNFTIcon = (nftType?: string) => {
    switch (nftType) {
      case 'gpa_guardian': return '🎓';
      case 'research_rockstar': return '🔬';
      case 'leadership_legend': return '👑';
      default: return '';
    }
  };

  const generateQRCode = (qrCode: string) => {
    // In a real app, this would generate an actual QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`;
  };

  if (!isAuthenticated) {
    return (
      <Layout title="My Tickets - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to view your tickets.</p>
            <a href="/login" className="btn-primary">
              Sign In
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="My Tickets - Academic NFT Marketplace">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tickets...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Tickets - Academic NFT Marketplace">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                My Event Tickets
              </h1>
              <p className="text-xl text-gray-200">
                Welcome back, {user?.firstName}! Here are your upcoming and past events.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {tickets.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎫</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Tickets Yet</h2>
              <p className="text-gray-600 mb-8">You haven't purchased any event tickets yet.</p>
              <a href="/tickets" className="btn-primary">
                Browse Events
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-2xl font-bold text-gray-900">{ticket.eventTitle}</h3>
                            {ticket.nftDiscountApplied && (
                              <div className="flex items-center space-x-1 px-3 py-1 bg-purple-100 rounded-full">
                                <span className="text-sm">{getNFTIcon(ticket.nftDiscountApplied)}</span>
                                <span className="text-xs font-medium text-purple-700">NFT Discount</span>
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center text-gray-600">
                            <CalendarIcon className="w-5 h-5 mr-2" />
                            <div>
                              <div className="font-medium">{new Date(ticket.eventDate).toLocaleDateString()}</div>
                              <div className="text-sm">{ticket.eventTime}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPinIcon className="w-5 h-5 mr-2" />
                            <div className="text-sm">{ticket.eventLocation}</div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <TicketIcon className="w-5 h-5 mr-2" />
                            <div>
                              <div className="font-medium">#{ticket.ticketNumber}</div>
                              <div className="text-sm">
                                {ticket.pricePaid === 0 ? 'FREE' : `$${ticket.pricePaid.toFixed(2)}`}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          Purchased on {new Date(ticket.purchaseDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-6 lg:mt-0 lg:ml-6 flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-2">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowQRCode(true);
                          }}
                          className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                          disabled={ticket.status === 'expired'}
                        >
                          <QrCodeIcon className="w-5 h-5" />
                          <span>Show QR Code</span>
                        </button>
                        <a
                          href={`/tickets/${ticket.eventId}`}
                          className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                        >
                          Event Details
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* QR Code Modal */}
        {showQRCode && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Event Ticket</h3>
                <p className="text-gray-600">{selectedTicket.eventTitle}</p>
              </div>
              
              <div className="mb-6">
                <img
                  src={generateQRCode(selectedTicket.qrCode)}
                  alt="QR Code"
                  className="mx-auto mb-4"
                />
                <p className="text-sm text-gray-600 font-mono">{selectedTicket.qrCode}</p>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <div>Ticket: #{selectedTicket.ticketNumber}</div>
                  <div>Date: {new Date(selectedTicket.eventDate).toLocaleDateString()}</div>
                  <div>Time: {selectedTicket.eventTime}</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowQRCode(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyTicketsPage;