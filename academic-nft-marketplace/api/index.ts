import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://academic-nft-marketplace.vercel.app', process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '']
    : ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Academic NFT Marketplace API is running on Vercel!'
  });
});

// Simple auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found. Try: demo@student.edu' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university,
        role: user.role
      },
      token: 'demo-token-' + user.id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Simple register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, universityEmail, firstName, lastName, university, studentId } = req.body;
    
    if (!email || !universityEmail || !firstName || !lastName || !university) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { universityEmail }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        universityEmail,
        firstName,
        lastName,
        university,
        studentId,
        emailVerified: true // Auto-verify for simplicity
      }
    });

    res.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        university: user.university,
        role: user.role
      },
      token: 'demo-token-' + user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Get achievements
app.get('/api/achievements', async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            university: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get opportunities
app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: { status: 'active' },
      include: {
        company: {
          select: {
            name: true,
            industry: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(opportunities);
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get all NFTs
app.get('/api/nfts', async (req, res) => {
  try {
    const nfts = await prisma.nFTToken.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            university: true
          }
        },
        achievement: {
          select: {
            title: true,
            type: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(nfts);
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

// Get user-specific NFTs (demo implementation)
app.get('/api/nfts/user', async (req, res) => {
  try {
    // For demo, get NFTs for demo user
    const nfts = await prisma.nFTToken.findMany({
      where: {
        userId: '08cf72f9-8db2-469c-b9e4-f865e037b25d' // Demo user ID
      },
      include: {
        achievement: {
          select: {
            title: true,
            type: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(nfts);
  } catch (error) {
    console.error('Get user NFTs error:', error);
    res.status(500).json({ error: 'Failed to fetch user NFTs' });
  }
});

// Get user-specific achievements (demo implementation)
app.get('/api/achievements/user', async (req, res) => {
  try {
    // For demo, get achievements for demo user
    const achievements = await prisma.achievement.findMany({
      where: {
        userId: '08cf72f9-8db2-469c-b9e4-f865e037b25d' // Demo user ID
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            university: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// === TICKETING SYSTEM API ENDPOINTS ===

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    // Sample events data
    const sampleEvents = [
      {
        id: '1',
        title: 'Future of Academic Research Conference',
        description: 'Join leading researchers and academics to explore cutting-edge developments in academic research methodologies and emerging technologies.',
        fullDescription: 'This comprehensive conference brings together the brightest minds in academia to discuss the future of research. Over the course of a full day, participants will engage with cutting-edge research methodologies, emerging technologies, and innovative approaches to academic inquiry.',
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
        ],
        status: 'active'
      },
      {
        id: '2',
        title: 'Student Leadership Summit 2025',
        description: 'Develop your leadership skills with workshops, networking sessions, and talks from successful student leaders across universities.',
        fullDescription: 'The Student Leadership Summit 2025 is designed to empower the next generation of academic and professional leaders. This intensive full-day program features interactive workshops, panel discussions, and networking opportunities with established leaders from various fields.',
        date: '2025-08-22',
        time: '10:00 AM - 6:00 PM',
        location: 'Stanford University, Palo Alto, CA',
        price: 45,
        maxAttendees: 300,
        currentAttendees: 178,
        image: '/api/placeholder/600/400',
        nftDiscounts: {
          gpa_guardian: 15,
          research_rockstar: 20,
          leadership_legend: 100
        },
        tags: ['Leadership', 'Networking', 'Development'],
        organizer: 'Stanford Student Leadership Council',
        status: 'active'
      },
      {
        id: '3',
        title: 'Cross-University Networking Night',
        description: 'Connect with students, alumni, and professionals from partner universities. Perfect for building your academic and professional network.',
        fullDescription: 'Join us for an exclusive evening of networking and connection-building with peers from top universities across the country.',
        date: '2025-08-30',
        time: '6:00 PM - 9:00 PM',
        location: 'MIT Campus, Boston, MA',
        price: 25,
        maxAttendees: 200,
        currentAttendees: 89,
        image: '/api/placeholder/600/400',
        nftDiscounts: {
          gpa_guardian: 20,
          research_rockstar: 30,
          leadership_legend: 40
        },
        tags: ['Networking', 'Social', 'Career'],
        organizer: 'Inter-University Alliance',
        status: 'active'
      },
      {
        id: '4',
        title: 'Graduate School Application Workshop',
        description: 'Get expert guidance on graduate school applications, personal statements, and interview preparation from admissions counselors.',
        fullDescription: 'Navigate the complex graduate school application process with confidence. This comprehensive workshop covers everything from selecting the right programs to crafting compelling personal statements.',
        date: '2025-09-05',
        time: '2:00 PM - 5:00 PM',
        location: 'Eastern Michigan University, Ypsilanti, MI',
        price: 20,
        maxAttendees: 150,
        currentAttendees: 67,
        image: '/api/placeholder/600/400',
        nftDiscounts: {
          gpa_guardian: 25,
          research_rockstar: 15,
          leadership_legend: 10
        },
        tags: ['Graduate School', 'Workshop', 'Career'],
        organizer: 'Graduate Admissions Collective',
        status: 'active'
      }
    ];

    res.json(sampleEvents);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get specific event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sampleEvents = {
      '1': {
        id: '1',
        title: 'Future of Academic Research Conference',
        description: 'Join leading researchers and academics to explore cutting-edge developments in academic research methodologies and emerging technologies.',
        fullDescription: 'This comprehensive conference brings together the brightest minds in academia to discuss the future of research.',
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
        ],
        status: 'active'
      }
    };

    const event = sampleEvents[id];
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Purchase tickets
app.post('/api/tickets/purchase', async (req, res) => {
  try {
    const { eventId, quantity, userNFTs } = req.body;
    
    if (!eventId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Event ID and valid quantity are required' });
    }

    // Get event details
    const eventPrices = {
      '1': { price: 75, nftDiscounts: { gpa_guardian: 20, research_rockstar: 100, leadership_legend: 30 } },
      '2': { price: 45, nftDiscounts: { gpa_guardian: 15, research_rockstar: 20, leadership_legend: 100 } },
      '3': { price: 25, nftDiscounts: { gpa_guardian: 20, research_rockstar: 30, leadership_legend: 40 } },
      '4': { price: 20, nftDiscounts: { gpa_guardian: 25, research_rockstar: 15, leadership_legend: 10 } }
    };

    const eventData = eventPrices[eventId];
    if (!eventData) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate best discount
    let bestDiscount = 0;
    let appliedNFT = null;
    
    if (userNFTs && Array.isArray(userNFTs)) {
      userNFTs.forEach(nft => {
        const discount = eventData.nftDiscounts[nft];
        if (discount > bestDiscount) {
          bestDiscount = discount;
          appliedNFT = nft;
        }
      });
    }

    const discountedPrice = bestDiscount === 100 ? 0 : eventData.price * (1 - bestDiscount / 100);
    const totalPrice = discountedPrice * quantity;

    // Generate ticket(s)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = `ANM-2025-${Date.now()}-${i + 1}`;
      const qrCode = `ACAD-NFT-${eventId}-${Date.now()}-${i + 1}`;
      
      tickets.push({
        id: `ticket-${Date.now()}-${i}`,
        eventId,
        ticketNumber,
        qrCode,
        pricePaid: discountedPrice,
        nftDiscountApplied: appliedNFT,
        discountAmount: bestDiscount,
        purchaseDate: new Date().toISOString(),
        status: 'active'
      });
    }

    res.json({
      message: 'Tickets purchased successfully',
      tickets,
      totalAmount: totalPrice,
      discountApplied: bestDiscount,
      nftUsed: appliedNFT
    });
  } catch (error) {
    console.error('Purchase tickets error:', error);
    res.status(500).json({ error: 'Failed to purchase tickets' });
  }
});

// Get user's tickets
app.get('/api/tickets/user', async (req, res) => {
  try {
    const sampleTickets = [
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
      }
    ];

    res.json(sampleTickets);
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch user tickets' });
  }
});

// Validate ticket QR code
app.post('/api/tickets/validate', async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    if (!qrCode) {
      return res.status(400).json({ error: 'QR code is required' });
    }

    const validQRCodes = [
      'ACAD-NFT-RESEARCH-2025-001',
      'ACAD-NFT-LEADERSHIP-2025-002',
      'ACAD-NFT-NETWORK-2025-003'
    ];

    if (!validQRCodes.includes(qrCode)) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Invalid QR code' 
      });
    }

    const ticketInfo = {
      valid: true,
      ticketNumber: 'ANM-2025-001',
      eventTitle: 'Future of Academic Research Conference',
      eventDate: '2025-09-15',
      eventTime: '9:00 AM - 5:00 PM',
      attendeeName: 'John Demo',
      status: 'active'
    };

    res.json(ticketInfo);
  } catch (error) {
    console.error('Validate ticket error:', error);
    res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

// Get user's NFT types for discount calculation
app.get('/api/user/nft-types', async (req, res) => {
  try {
    const userNFTTypes = ['gpa_guardian', 'research_rockstar'];
    
    res.json({
      nftTypes: userNFTTypes,
      message: 'User NFT types retrieved successfully'
    });
  } catch (error) {
    console.error('Get user NFT types error:', error);
    res.status(500).json({ error: 'Failed to fetch user NFT types' });
  }
});

// Export handler for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return app(req, res);
};