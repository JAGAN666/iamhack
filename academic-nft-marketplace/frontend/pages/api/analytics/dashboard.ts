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
    
    // Return dashboard analytics data
    return res.json({
      personal_stats: {
        total_achievements: 12,
        verified_achievements: 8,
        nfts_owned: 5,
        rare_nfts: 3,
        legendary_nfts: 1,
        total_experience: 2400,
        level: 5,
        rank_percentile: 92
      },
      activity_timeline: [
        {
          date: '2024-12-20',
          type: 'achievement',
          title: 'Dean\'s List Achievement unlocked',
          points: 500
        },
        {
          date: '2024-12-18',
          type: 'collaboration',
          title: 'Research collaboration completed',
          points: 750
        },
        {
          date: '2024-12-15',
          type: 'nft',
          title: 'Innovation Titan NFT minted',
          points: 1000
        }
      ],
      performance_metrics: {
        weekly_progress: {
          achievements_earned: 2,
          experience_gained: 850,
          nfts_minted: 1,
          opportunities_unlocked: 5
        },
        monthly_goals: {
          target_achievements: 15,
          current_achievements: 12,
          progress_percentage: 80,
          target_level: 6,
          current_level: 5
        }
      },
      peer_comparison: {
        university_rank: 15,
        national_rank: 342,
        similar_users: [
          {
            name: 'Sarah Chen',
            university: 'MIT',
            achievements: 15,
            level: 6
          },
          {
            name: 'Michael Rodriguez',
            university: 'Stanford',
            achievements: 11,
            level: 4
          }
        ]
      },
      recommendations: [
        'Complete 3 more achievements to reach Level 6',
        'Your Research Rockstar NFT qualifies you for 8 new opportunities',
        'Consider participating in the upcoming Innovation Challenge'
      ]
    });

  } catch (error) {
    console.error('Dashboard analytics API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}