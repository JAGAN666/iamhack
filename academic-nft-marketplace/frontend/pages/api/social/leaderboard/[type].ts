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
    const { type } = req.query;
    
    // Return leaderboard data based on type
    if (type === 'global') {
      return res.json({
        leaderboard: [
          {
            rank: 1,
            user: {
              id: 'user-sarah-chen',
              name: 'Sarah Chen',
              avatar: '/api/placeholder/avatar-sarah.jpg',
              university: 'MIT',
              level: 6
            },
            score: 3250,
            achievements: 18,
            nfts: 8,
            badge: 'Research Master'
          },
          {
            rank: 2,
            user: {
              id: 'user-michael-rodriguez',
              name: 'Michael Rodriguez',
              avatar: '/api/placeholder/avatar-michael.jpg',
              university: 'Stanford',
              level: 5
            },
            score: 2890,
            achievements: 15,
            nfts: 6,
            badge: 'Leadership Elite'
          },
          {
            rank: 3,
            user: {
              id: '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University',
              level: 5
            },
            score: 2400,
            achievements: 12,
            nfts: 5,
            badge: 'Innovation Star',
            isCurrentUser: true
          },
          {
            rank: 4,
            user: {
              id: 'user-emily-watson',
              name: 'Dr. Emily Watson',
              avatar: '/api/placeholder/avatar-emily.jpg',
              university: 'University of Michigan',
              level: 8
            },
            score: 2200,
            achievements: 20,
            nfts: 12,
            badge: 'Mentor Master'
          },
          {
            rank: 5,
            user: {
              id: 'user-david-kim',
              name: 'David Kim',
              avatar: '/api/placeholder/avatar-david.jpg',
              university: 'CMU',
              level: 4
            },
            score: 1950,
            achievements: 10,
            nfts: 4,
            badge: 'Rising Scholar'
          }
        ],
        user_rank: {
          current_rank: 3,
          total_users: 1247,
          percentile: 99.8,
          points_to_next: 490,
          next_rank_user: 'Michael Rodriguez'
        },
        period: 'all_time',
        last_updated: new Date().toISOString()
      });
    }

    if (type === 'university') {
      return res.json({
        leaderboard: [
          {
            rank: 1,
            user: {
              id: '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University',
              level: 5
            },
            score: 2400,
            achievements: 12,
            nfts: 5,
            badge: 'University Champion',
            isCurrentUser: true
          },
          {
            rank: 2,
            user: {
              id: 'user-lisa-park',
              name: 'Lisa Park',
              avatar: '/api/placeholder/avatar-lisa.jpg',
              university: 'Eastern Michigan University',
              level: 4
            },
            score: 1850,
            achievements: 9,
            nfts: 3,
            badge: 'Academic Star'
          },
          {
            rank: 3,
            user: {
              id: 'user-james-wilson',
              name: 'James Wilson',
              avatar: '/api/placeholder/avatar-james.jpg',
              university: 'Eastern Michigan University',
              level: 3
            },
            score: 1650,
            achievements: 7,
            nfts: 2,
            badge: 'Rising Talent'
          }
        ],
        user_rank: {
          current_rank: 1,
          total_users: 847,
          percentile: 100,
          points_to_next: 0,
          achievement: 'Top of University!'
        },
        period: 'all_time',
        last_updated: new Date().toISOString()
      });
    }

    if (type === 'weekly') {
      return res.json({
        leaderboard: [
          {
            rank: 1,
            user: {
              id: '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University',
              level: 5
            },
            score: 850,
            achievements: 2,
            nfts: 1,
            badge: 'Weekly Leader',
            isCurrentUser: true
          },
          {
            rank: 2,
            user: {
              id: 'user-alex-johnson',
              name: 'Alex Johnson',
              avatar: '/api/placeholder/avatar-alex.jpg',
              university: 'University of Michigan',
              level: 3
            },
            score: 720,
            achievements: 2,
            nfts: 0,
            badge: 'Weekly Star'
          }
        ],
        user_rank: {
          current_rank: 1,
          total_users: 356,
          percentile: 100,
          points_to_next: 0,
          achievement: 'Weekly Champion!'
        },
        period: 'weekly',
        last_updated: new Date().toISOString()
      });
    }

    // Default global leaderboard
    return res.json({
      leaderboard: [],
      user_rank: {
        current_rank: null,
        total_users: 0
      },
      period: type || 'global',
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Social leaderboard API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}