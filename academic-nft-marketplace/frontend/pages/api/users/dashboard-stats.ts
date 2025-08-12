import { NextApiRequest, NextApiResponse } from 'next';

// Helper function to get user from authorization header
async function getUserFromAuth(req: NextApiRequest): Promise<any> {
  const authHeader = req.headers.authorization;
  console.log('🔍 Dashboard stats - checking auth header:', authHeader ? 'Bearer token present' : 'No auth header');
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('❌ No valid authorization token provided');
    throw new Error('No valid authorization token provided');
  }

  const token = authHeader.split(' ')[1];
  console.log('🔑 Token received:', token.substring(0, 20) + '...');
  
  // Check if it's any demo/test token (dynamic or static)
  if (token.startsWith('demo-token') || token.startsWith('test-token') || token === 'demo-token-12345') {
    console.log('🎭 Demo/test token detected, returning demo user');
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

  // For Supabase JWT tokens, extract user info (simplified for demo)
  if (token.length > 50 && token.includes('.')) {
    console.log('🔐 Supabase JWT token detected');
    try {
      // In production, verify JWT with Supabase
      // For now, return a basic authenticated user
      return {
        id: 'supabase-user-id',
        email: 'user@example.com',
        firstName: 'New',
        lastName: 'User',
        university: 'University',
        role: 'student',
        emailVerified: true
      };
    } catch (error) {
      console.error('❌ Error validating Supabase token:', error);
      throw new Error('Invalid Supabase token');
    }
  }

  console.error('❌ Unrecognized token format');
  throw new Error('Invalid token format');
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
    
    // For demo user, return static data
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
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

    // For new Supabase users, return basic stats
    return res.json({
      totalAchievements: 0,
      verifiedAchievements: 0,
      mintedNFTs: 0,
      unlockedOpportunities: 0,
      level: 1,
      xp: 0,
      totalXP: 500,
      streakDays: 0,
      rank: 'Rising Scholar',
      battlePassLevel: 1,
      skillPoints: 0,
      rareAchievements: 0,
      legendaryAchievements: 0
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}