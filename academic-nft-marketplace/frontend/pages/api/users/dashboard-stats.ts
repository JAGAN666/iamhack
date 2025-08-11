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
      id: '08cf72f9-8db2-469c-b9e4-f865e037b25d',
      email: 'demo@student.edu',
      firstName: 'John',
      lastName: 'Demo',
      university: 'Eastern Michigan University',
      role: 'student',
      emailVerified: true
    };
  }

  // For now, return a basic user object for Supabase tokens
  // In production, this would verify the JWT token with Supabase
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