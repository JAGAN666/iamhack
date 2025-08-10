import { VercelRequest, VercelResponse } from '@vercel/node';

// Simple serverless function handler for Academic NFT Marketplace
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Route handlers
    if (url === '/api/health') {
      return handleHealth(req, res);
    }
    
    if (url === '/api/events') {
      return handleEvents(req, res);
    }
    
    if (url?.startsWith('/api/events/')) {
      const eventId = url.split('/api/events/')[1];
      return handleEventById(req, res, eventId);
    }
    
    if (url === '/api/tickets/user') {
      return handleUserTickets(req, res);
    }
    
    if (url === '/api/tickets/purchase') {
      return handleTicketPurchase(req, res);
    }
    
    if (url === '/api/user/nft-types') {
      return handleUserNFTTypes(req, res);
    }

    if (url === '/api/auth/login') {
      return handleLogin(req, res);
    }

    if (url === '/api/users/dashboard-stats') {
      return handleDashboardStats(req, res);
    }

    if (url === '/api/achievements/user') {
      return handleUserAchievements(req, res);
    }

    if (url === '/api/nfts/user') {
      return handleUserNFTs(req, res);
    }

    // Default 404 for unmatched routes
    return res.status(404).json({ error: 'API endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Health check endpoint
function handleHealth(req: VercelRequest, res: VercelResponse) {
  return res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Academic NFT Marketplace API is running on Vercel!'
  });
}

// Events endpoints
function handleEvents(req: VercelRequest, res: VercelResponse) {
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
    }
  ];

  return res.json(sampleEvents);
}

function handleEventById(req: VercelRequest, res: VercelResponse, eventId: string) {
  const sampleEvents: { [key: string]: any } = {
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

  const event = sampleEvents[eventId];
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  return res.json(event);
}

function handleUserTickets(req: VercelRequest, res: VercelResponse) {
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

  return res.json(sampleTickets);
}

function handleTicketPurchase(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, quantity, userNFTs } = req.body;
  
  if (!eventId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Event ID and valid quantity are required' });
  }

  // Event pricing data
  const eventPrices: { [key: string]: any } = {
    '1': { price: 75, nftDiscounts: { gpa_guardian: 20, research_rockstar: 100, leadership_legend: 30 } },
    '2': { price: 45, nftDiscounts: { gpa_guardian: 15, research_rockstar: 20, leadership_legend: 100 } },
    '3': { price: 25, nftDiscounts: { gpa_guardian: 20, research_rockstar: 30, leadership_legend: 40 } }
  };

  const eventData = eventPrices[eventId];
  if (!eventData) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Calculate best discount
  let bestDiscount = 0;
  let appliedNFT = null;
  
  if (userNFTs && Array.isArray(userNFTs)) {
    userNFTs.forEach((nft: string) => {
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

  return res.json({
    message: 'Tickets purchased successfully',
    tickets,
    totalAmount: totalPrice,
    discountApplied: bestDiscount,
    nftUsed: appliedNFT
  });
}

function handleUserNFTTypes(req: VercelRequest, res: VercelResponse) {
  const userNFTTypes = ['gpa_guardian', 'research_rockstar'];
  
  return res.json({
    nftTypes: userNFTTypes,
    message: 'User NFT types retrieved successfully'
  });
}

function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Simple demo authentication
  if (email === 'demo@student.edu') {
    return res.json({
      message: 'Login successful',
      user: {
        id: '08cf72f9-8db2-469c-b9e4-f865e037b25d',
        email: 'demo@student.edu',
        firstName: 'John',
        lastName: 'Demo',
        university: 'Eastern Michigan University',
        role: 'student',
        emailVerified: true  // Demo user should be verified
      },
      token: 'demo-token-12345'
    });
  }

  return res.status(404).json({ error: 'User not found. Try: demo@student.edu' });
}

function handleDashboardStats(req: VercelRequest, res: VercelResponse) {
  // Return comprehensive dashboard stats for demo user
  const demoStats = {
    totalAchievements: 12,
    verifiedAchievements: 8,
    mintedNFTs: 5,
    unlockedOpportunities: 23,
    level: 5,
    xp: 2400,
    totalXP: 5000,
    streakDays: 15,
    rank: 'Epic Scholar',
    battlePassLevel: 7,
    skillPoints: 120,
    rareAchievements: 3,
    legendaryAchievements: 1
  };

  return res.json(demoStats);
}

function handleUserAchievements(req: VercelRequest, res: VercelResponse) {
  // Return sample user achievements
  const userAchievements = [
    {
      id: '1',
      title: 'Dean\'s List Recognition',
      description: 'Achieved Dean\'s List status with 3.8 GPA in Computer Science',
      type: 'academic',
      category: 'GPA',
      date: '2024-12-15',
      status: 'verified',
      proofUrl: '/achievements/deans-list.pdf',
      nftMinted: true,
      nftTokenId: 'nft_001',
      verifiedBy: 'Eastern Michigan University',
      verificationDate: '2024-12-20',
      skillTags: ['Academic Excellence', 'Computer Science', 'Mathematics'],
      confidenceScore: 0.98
    },
    {
      id: '2', 
      title: 'Research Publication',
      description: 'Co-authored paper on Machine Learning in Academic Systems',
      type: 'research',
      category: 'Publication',
      date: '2024-11-10',
      status: 'verified',
      proofUrl: '/achievements/research-paper.pdf',
      nftMinted: true,
      nftTokenId: 'nft_002',
      verifiedBy: 'IEEE Conference',
      verificationDate: '2024-11-15',
      skillTags: ['Research', 'Machine Learning', 'Academic Writing'],
      confidenceScore: 0.96
    },
    {
      id: '3',
      title: 'Student Government President',
      description: 'Elected as Student Government President for 2024-2025 term',
      type: 'leadership',
      category: 'Leadership Role',
      date: '2024-09-01',
      status: 'verified',
      proofUrl: '/achievements/president-certificate.pdf',
      nftMinted: true,
      nftTokenId: 'nft_003',
      verifiedBy: 'Student Affairs Office',
      verificationDate: '2024-09-05',
      skillTags: ['Leadership', 'Public Speaking', 'Event Management'],
      confidenceScore: 1.0
    }
  ];

  return res.json(userAchievements);
}

function handleUserNFTs(req: VercelRequest, res: VercelResponse) {
  // Return sample user NFTs
  const userNFTs = [
    {
      id: 'nft_001',
      tokenId: '1',
      name: 'GPA Guardian',
      description: 'Elite academic performance NFT - Dean\'s List Recognition',
      type: 'gpa_guardian',
      rarity: 'Epic',
      level: 3,
      experience: 2400,
      attributes: {
        gpa: 3.8,
        university: 'Eastern Michigan University',
        achievement: 'Dean\'s List',
        semester: 'Fall 2024'
      },
      imageUrl: '/nfts/gpa-guardian.png',
      animationUrl: '/nfts/gpa-guardian.mp4',
      createdAt: '2024-12-20',
      lastEvolved: '2024-12-20',
      stakingRewards: 150,
      marketValue: 0.15,
      achievements: ['Dean\'s List Q4 2024']
    },
    {
      id: 'nft_002',
      tokenId: '2', 
      name: 'Research Rockstar',
      description: 'Research excellence NFT - Published IEEE Paper',
      type: 'research_rockstar',
      rarity: 'Legendary',
      level: 5,
      experience: 3500,
      attributes: {
        publications: 1,
        citations: 8,
        field: 'Machine Learning',
        journal: 'IEEE Conference'
      },
      imageUrl: '/nfts/research-rockstar.png',
      animationUrl: '/nfts/research-rockstar.mp4',
      createdAt: '2024-11-15',
      lastEvolved: '2024-11-20',
      stakingRewards: 250,
      marketValue: 0.35,
      achievements: ['First Publication', 'IEEE Recognition']
    },
    {
      id: 'nft_003',
      tokenId: '3',
      name: 'Leadership Legend',
      description: 'Leadership mastery NFT - Student Government President',
      type: 'leadership_legend',
      rarity: 'Epic',
      level: 4,
      experience: 3000,
      attributes: {
        role: 'President',
        organization: 'Student Government',
        duration: '1 Year',
        impact: 'University-wide'
      },
      imageUrl: '/nfts/leadership-legend.png',
      animationUrl: '/nfts/leadership-legend.mp4',
      createdAt: '2024-09-05',
      lastEvolved: '2024-10-15',
      stakingRewards: 200,
      marketValue: 0.25,
      achievements: ['Elected President', 'Policy Changes']
    }
  ];

  return res.json(userNFTs);
}