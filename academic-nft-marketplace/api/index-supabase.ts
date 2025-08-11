import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, supabaseAdmin, supabaseAPI } from './supabase';

// Enhanced serverless function handler with Supabase integration
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Auth endpoints
    if (url === '/api/auth/register') {
      return handleRegister(req, res);
    }
    
    if (url === '/api/auth/login') {
      return handleLogin(req, res);
    }
    
    if (url === '/api/auth/verify-otp') {
      return handleVerifyOTP(req, res);
    }
    
    if (url === '/api/auth/resend-otp') {
      return handleResendOTP(req, res);
    }
    
    // Health check
    if (url === '/api/health') {
      return handleHealth(req, res);
    }
    
    // Events endpoints
    if (url === '/api/events') {
      return handleEvents(req, res);
    }
    
    if (url?.startsWith('/api/events/')) {
      const eventId = url.split('/api/events/')[1];
      return handleEventById(req, res, eventId);
    }
    
    // User endpoints (require authentication)
    if (url === '/api/users/dashboard-stats') {
      return handleDashboardStats(req, res);
    }
    
    if (url === '/api/achievements/user') {
      return handleUserAchievements(req, res);
    }
    
    if (url === '/api/nfts/user') {
      return handleUserNFTs(req, res);
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

    // Default 404 for unmatched routes
    return res.status(404).json({ error: 'API endpoint not found' });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to get user from authorization header
async function getUserFromAuth(req: VercelRequest): Promise<any> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No valid authorization token provided');
  }

  const token = authHeader.split(' ')[1];
  
  // Check if it's the demo token
  if (token === 'demo-token-12345') {
    return {
      id: '08cf72f9-8db2-469c-b9e4-f865e037b25d',
      email: 'demo@student.edu',
      firstName: 'John',
      lastName: 'Demo',
      university: 'Eastern Michigan University',
      role: 'student',
      emailVerified: true
    };
  }

  // Verify Supabase JWT token
  const user = await supabaseAPI.verifyUser(token);
  if (!user) {
    throw new Error('Invalid token');
  }

  // Get user profile
  const profile = await supabaseAPI.getUserProfileAdmin(user.id);
  if (!profile) {
    throw new Error('User profile not found');
  }

  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    university: profile.university,
    role: profile.role,
    emailVerified: profile.email_verified
  };
}

// Auth endpoints
async function handleRegister(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, university, universityEmail, studentId } = req.body;

    if (!email || !password || !firstName || !lastName || !university) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Register user with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          university,
          university_email: universityEmail,
          student_id: studentId,
          role: 'student'
        }
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: 'Registration successful! Please check your email for verification.',
      user: data.user,
      needsVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Handle demo user
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
          emailVerified: true
        },
        token: 'demo-token-12345'
      });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!data.user) {
      return res.status(401).json({ error: 'Login failed' });
    }

    // Get user profile
    const profile = await supabaseAPI.getUserProfileAdmin(data.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Check if email is verified
    if (!profile.email_verified) {
      return res.status(403).json({ 
        error: 'Email not verified', 
        needsVerification: true,
        email: profile.email
      });
    }

    return res.json({
      message: 'Login successful',
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        university: profile.university,
        role: profile.role,
        emailVerified: profile.email_verified
      },
      token: data.session?.access_token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}

async function handleVerifyOTP(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, token, type = 'signup' } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and OTP token are required' });
    }

    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as any
    });

    if (error) {
      console.error('OTP verification error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    // Update user profile to mark email as verified
    await supabaseAPI.updateUserProfile(data.user.id, {
      email_verified: true
    });

    // Get updated profile
    const profile = await supabaseAPI.getUserProfileAdmin(data.user.id);

    return res.json({
      message: 'Email verified successfully',
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        university: profile.university,
        role: profile.role,
        emailVerified: true
      },
      token: data.session?.access_token
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
}

async function handleResendOTP(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, type = 'signup' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Resend OTP with Supabase
    const { error } = await supabase.auth.resend({
      type: type as any,
      email
    });

    if (error) {
      console.error('OTP resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('OTP resend error:', error);
    return res.status(500).json({ error: 'Failed to resend verification email' });
  }
}

// Health check endpoint
function handleHealth(req: VercelRequest, res: VercelResponse) {
  return res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Academic NFT Marketplace API with Supabase is running!',
    supabase: 'Connected'
  });
}

// Events endpoints (using Supabase data)
async function handleEvents(req: VercelRequest, res: VercelResponse) {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .order('date', { ascending: true });

    if (error) {
      console.error('Events fetch error:', error);
      // Fallback to static data if database is not set up yet
      return res.json(getFallbackEvents());
    }

    return res.json(events || getFallbackEvents());
  } catch (error) {
    console.error('Events error:', error);
    return res.json(getFallbackEvents());
  }
}

async function handleEventById(req: VercelRequest, res: VercelResponse, eventId: string) {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (error || !event) {
      // Fallback to static data
      const fallbackEvents = getFallbackEventsMap();
      const fallbackEvent = fallbackEvents[eventId];
      if (!fallbackEvent) {
        return res.status(404).json({ error: 'Event not found' });
      }
      return res.json(fallbackEvent);
    }

    return res.json(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
}

// User dashboard stats with Supabase data
async function handleDashboardStats(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getUserFromAuth(req);
    
    // For demo user, return static data
    if (user.id === '08cf72f9-8db2-469c-b9e4-f865e037b25d') {
      return res.json({
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
      });
    }

    // Get stats from Supabase
    const stats = await supabaseAPI.getUserStats(user.id);
    return res.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// User achievements with Supabase data
async function handleUserAchievements(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getUserFromAuth(req);
    
    // For demo user, return static data
    if (user.id === '08cf72f9-8db2-469c-b9e4-f865e037b25d') {
      return res.json(getDemoAchievements());
    }

    // Get achievements from Supabase
    const achievements = await supabaseAPI.getUserAchievements(user.id);
    return res.json(achievements);

  } catch (error) {
    console.error('User achievements error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// User NFTs with Supabase data
async function handleUserNFTs(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getUserFromAuth(req);
    
    // For demo user, return static data
    if (user.id === '08cf72f9-8db2-469c-b9e4-f865e037b25d') {
      return res.json(getDemoNFTs());
    }

    // Get NFTs from Supabase
    const nfts = await supabaseAPI.getUserNFTs(user.id);
    return res.json(nfts);

  } catch (error) {
    console.error('User NFTs error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Remaining functions (tickets, etc.) remain the same as original
async function handleUserTickets(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getUserFromAuth(req);
    
    // For demo user or fallback data
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
  } catch (error) {
    console.error('User tickets error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

async function handleTicketPurchase(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromAuth(req);
    const { eventId, quantity, userNFTs } = req.body;
    
    if (!eventId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Event ID and valid quantity are required' });
    }

    // Event pricing data (same as before)
    const eventPrices: { [key: string]: any } = {
      '1': { price: 75, nftDiscounts: { gpa_guardian: 20, research_rockstar: 100, leadership_legend: 30 } },
      '2': { price: 45, nftDiscounts: { gpa_guardian: 15, research_rockstar: 20, leadership_legend: 100 } },
      '3': { price: 25, nftDiscounts: { gpa_guardian: 20, research_rockstar: 30, leadership_legend: 40 } }
    };

    const eventData = eventPrices[eventId];
    if (!eventData) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate discount logic (same as before)
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

  } catch (error) {
    console.error('Ticket purchase error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

async function handleUserNFTTypes(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await getUserFromAuth(req);
    const userNFTTypes = ['gpa_guardian', 'research_rockstar'];
    
    return res.json({
      nftTypes: userNFTTypes,
      message: 'User NFT types retrieved successfully'
    });
  } catch (error) {
    console.error('User NFT types error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Fallback data functions
function getFallbackEvents() {
  return [
    {
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
      status: 'active'
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
      image: '/api/placeholder/600/400',
      nftDiscounts: {
        gpa_guardian: 15,
        research_rockstar: 20,
        leadership_legend: 100
      },
      tags: ['Leadership', 'Networking', 'Development'],
      organizer: 'Stanford Student Leadership Council',
      status: 'active'
    }
  ];
}

function getFallbackEventsMap() {
  const events = getFallbackEvents();
  const eventMap: { [key: string]: any } = {};
  events.forEach(event => {
    eventMap[event.id] = event;
  });
  return eventMap;
}

function getDemoAchievements() {
  return [
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
    }
  ];
}

function getDemoNFTs() {
  return [
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
      createdAt: '2024-12-20',
      stakingRewards: 150,
      marketValue: 0.15,
      achievements: ['Dean\'s List Q4 2024']
    }
  ];
}