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
    const { userId } = req.query;
    
    // Return social profile data based on userId
    if (userId === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9' || userId === user.id) {
      return res.json({
        user: {
          id: '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
          firstName: 'John',
          lastName: 'Demo',
          username: 'johndemo',
          avatar: '/api/placeholder/avatar-john.jpg',
          university: 'Eastern Michigan University',
          major: 'Computer Science',
          graduationYear: 2025,
          bio: 'Passionate about AI research and academic excellence. Always happy to collaborate on innovative projects!',
          location: 'Ypsilanti, Michigan',
          website: 'https://johndemo.dev'
        },
        stats: {
          level: 5,
          totalAchievements: 12,
          verifiedAchievements: 8,
          nftsOwned: 5,
          socialScore: 892,
          connections: 156,
          followers: 89,
          following: 67,
          posts: 25,
          collaborations: 8
        },
        achievements: [
          {
            id: 'ach-1',
            title: 'Dean\'s List Achievement',
            type: 'academic',
            rarity: 'Rare',
            verified: true,
            date: '2024-12-15'
          },
          {
            id: 'ach-2',
            title: 'Research Publication',
            type: 'research',
            rarity: 'Epic',
            verified: true,
            date: '2024-11-30'
          },
          {
            id: 'ach-4',
            title: 'Hackathon Winner',
            type: 'research',
            rarity: 'Legendary',
            verified: true,
            date: '2024-09-28'
          }
        ],
        nfts: [
          {
            id: 'nft-4',
            name: 'Innovation Titan - Legendary Creator',
            type: 'research_rockstar',
            rarity: 'mythic',
            level: 5,
            imageUrl: '/api/placeholder/nft-innovation-titan.png'
          },
          {
            id: 'nft-2',
            name: 'Research Rockstar - Innovation Master',
            type: 'research_rockstar',
            rarity: 'epic',
            level: 4,
            imageUrl: '/api/placeholder/nft-research-rockstar.png'
          }
        ],
        badges: [
          'Research Rockstar',
          'Leadership Legend',
          'GPA Guardian'
        ],
        recent_activity: [
          {
            type: 'achievement',
            title: 'Unlocked Dean\'s List Achievement',
            date: '2024-12-20T14:30:00Z'
          },
          {
            type: 'collaboration',
            title: 'Completed research with Sarah Chen',
            date: '2024-12-18T10:15:00Z'
          }
        ],
        skills: [
          'Machine Learning',
          'Research',
          'Leadership',
          'Academic Writing',
          'Innovation'
        ],
        interests: [
          'Artificial Intelligence',
          'Research',
          'Academic Excellence',
          'Collaboration',
          'Innovation'
        ],
        privacy: {
          achievements_public: true,
          nfts_public: true,
          stats_public: true,
          activity_public: true
        }
      });
    }

    // For other users, return basic public profile
    return res.json({
      user: {
        id: userId,
        firstName: 'Student',
        lastName: 'User',
        username: 'student_user',
        university: 'Unknown University',
        bio: 'Academic NFT Marketplace user'
      },
      stats: {
        level: 1,
        totalAchievements: 0,
        nftsOwned: 0,
        socialScore: 100
      },
      achievements: [],
      nfts: [],
      badges: [],
      privacy: {
        achievements_public: false,
        nfts_public: false,
        stats_public: true,
        activity_public: false
      }
    });

  } catch (error) {
    console.error('Social profile API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}