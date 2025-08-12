import { NextApiRequest, NextApiResponse } from 'next';

// Helper function to get user from authorization header
async function getUserFromAuth(req: NextApiRequest): Promise<any> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No valid authorization token provided');
  }

  const token = authHeader.split(' ')[1];
  
  // Check if it's the demo token
  if (token === 'demo-token-12345') {
    return {
      id: '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
      email: 'demo@student.edu',
      firstName: 'John',
      lastName: 'Demo',
      university: 'Eastern Michigan University',
      role: 'student',
      emailVerified: true
    };
  }

  return {
    id: 'supabase-user-id',
    email: 'user@example.com',
    firstName: 'New',
    lastName: 'User',
    university: 'University',
    role: 'student',
    emailVerified: true
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromAuth(req);
    
    // For demo user, return user tickets with additional details
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json({
        tickets: [
          {
            id: 'ticket-1',
            eventId: '1',
            ticketNumber: 'FUT2025-001',
            qrCode: 'QR-FUT2025-001',
            event: {
              id: '1',
              title: 'Future of Academic Research Conference',
              description: 'Join leading researchers to explore cutting-edge developments',
              date: '2025-09-15',
              time: '9:00 AM - 5:00 PM',
              location: 'Harvard University, Cambridge, MA',
              image: '/api/placeholder/400/250',
              organizer: 'Harvard Research Institute'
            },
            pricePaid: 60.00,
            originalPrice: 75.00,
            nftDiscountApplied: 'Research Rockstar',
            discountAmount: 15.00,
            purchaseDate: '2024-12-15T10:30:00Z',
            status: 'active',
            seat: 'A-15',
            checkInTime: null,
            benefits: ['Research Lab Access', 'Networking Session', 'Certificate'],
            agenda: [
              '9:00 AM - Registration & Coffee',
              '9:30 AM - Opening Keynote',
              '12:00 PM - Networking Lunch',
              '4:00 PM - Closing Remarks'
            ]
          },
          {
            id: 'ticket-2',
            eventId: '2',
            ticketNumber: 'SLS2025-002',
            qrCode: 'QR-SLS2025-002',
            event: {
              id: '2',
              title: 'Student Leadership Summit 2025',
              description: 'Develop leadership skills with workshops and networking',
              date: '2025-08-22',
              time: '10:00 AM - 6:00 PM',
              location: 'Stanford University, Palo Alto, CA',
              image: '/api/placeholder/400/250',
              organizer: 'Stanford Student Leadership Council'
            },
            pricePaid: 25.00,
            originalPrice: 45.00,
            nftDiscountApplied: 'Leadership Legend',
            discountAmount: 20.00,
            purchaseDate: '2024-12-10T14:20:00Z',
            status: 'active',
            seat: 'VIP-8',
            checkInTime: null,
            benefits: ['VIP Seating', 'Meet & Greet', 'Leadership Certificate', 'Lunch Included'],
            agenda: [
              '10:00 AM - Registration',
              '10:30 AM - Opening Keynote',
              '12:00 PM - Networking Lunch',
              '5:30 PM - Closing Ceremony'
            ]
          }
        ],
        summary: {
          totalTickets: 2,
          activeTickets: 2,
          usedTickets: 0,
          cancelledTickets: 0,
          totalSpent: 85.00,
          totalSaved: 35.00,
          upcomingEvents: 2
        },
        nftDiscounts: {
          'Research Rockstar': {
            used: 1,
            available: 'Unlimited',
            nextDiscount: '100% off research events'
          },
          'Leadership Legend': {
            used: 1,
            available: 'Unlimited', 
            nextDiscount: '100% off leadership events'
          }
        }
      });
    }

    // For new users, return empty tickets
    return res.json({
      tickets: [],
      summary: {
        totalTickets: 0,
        activeTickets: 0,
        usedTickets: 0,
        cancelledTickets: 0,
        totalSpent: 0,
        totalSaved: 0,
        upcomingEvents: 0
      },
      nftDiscounts: {}
    });

  } catch (error) {
    console.error('User tickets API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}