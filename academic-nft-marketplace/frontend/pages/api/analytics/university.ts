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
    
    // Return university analytics data
    return res.json({
      university_stats: {
        name: user.university || 'Eastern Michigan University',
        total_students: 847,
        active_students: 623,
        avg_achievements_per_student: 8.5,
        total_nfts_minted: 1250,
        research_publications: 45,
        leadership_positions: 89,
        community_service_hours: 12500
      },
      rankings: {
        national: 15,
        regional: 3,
        nft_adoption: 8,
        student_engagement: 12
      },
      comparison: {
        peer_universities: [
          {
            name: 'University of Michigan',
            students: 2300,
            avg_achievements: 12.5,
            nfts_minted: 3200
          },
          {
            name: 'Michigan State University',
            students: 1800,
            avg_achievements: 9.2,
            nfts_minted: 2100
          }
        ]
      },
      trends: {
        monthly_growth: 15.5,
        achievement_completion_rate: 78,
        nft_minting_rate: 65,
        engagement_score: 8.7
      }
    });

  } catch (error) {
    console.error('University analytics API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}