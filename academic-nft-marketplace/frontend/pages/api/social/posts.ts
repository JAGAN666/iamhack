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
    const { page = 1, limit = 10 } = req.query;
    
    // For demo user, return sample social posts
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json({
        posts: [
          {
            id: 'post-1',
            author: {
              id: '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University',
              level: 5,
              nftBadges: ['Research Rockstar', 'Leadership Legend']
            },
            content: 'Just unlocked my Dean\'s List Achievement NFT! 🏆 Hard work paying off - feeling grateful for all the late-night study sessions. Who else is grinding for their academic goals?',
            type: 'achievement_unlock',
            achievement: {
              id: 'ach-1',
              title: 'Dean\'s List Achievement',
              rarity: 'Rare',
              imageUrl: '/api/placeholder/nft-gpa-guardian.png'
            },
            timestamp: '2024-12-20T14:30:00Z',
            likes: 45,
            comments: 8,
            shares: 5,
            reactions: {
              like: 45,
              congratulations: 23,
              fire: 12,
              clap: 8
            },
            isLiked: false,
            isBookmarked: false,
            visibility: 'public',
            tags: ['achievement', 'academic', 'milestone']
          },
          {
            id: 'post-2',
            author: {
              id: 'user-sarah-chen',
              name: 'Sarah Chen',
              avatar: '/api/placeholder/avatar-sarah.jpg',
              university: 'Massachusetts Institute of Technology',
              level: 6,
              nftBadges: ['Research Rockstar', 'Innovation Titan']
            },
            content: 'Exciting news! Our collaborative research paper with @JohnDemo on ML applications in healthcare has been accepted for publication! 📚✨ This cross-university partnership shows the power of academic networking.',
            type: 'collaboration_success',
            timestamp: '2024-12-18T10:15:00Z',
            likes: 67,
            comments: 12,
            shares: 8,
            reactions: {
              like: 67,
              congratulations: 34,
              mind_blown: 18,
              heart: 15
            },
            isLiked: true,
            isBookmarked: true,
            visibility: 'public',
            tags: ['research', 'collaboration', 'publication']
          },
          {
            id: 'post-3',
            author: {
              id: 'user-michael-rodriguez',
              name: 'Michael Rodriguez',
              avatar: '/api/placeholder/avatar-michael.jpg',
              university: 'Stanford University',
              level: 4,
              nftBadges: ['Leadership Legend']
            },
            content: 'Planning the Cross-University Innovation Challenge 2025! 🚀 Looking for brilliant minds to join as mentors and participants. This year we\'re focusing on sustainability tech. DM me if interested!',
            type: 'event_announcement',
            timestamp: '2024-12-17T16:45:00Z',
            likes: 89,
            comments: 15,
            shares: 12,
            reactions: {
              like: 89,
              fire: 25,
              rocket: 18,
              clap: 20
            },
            isLiked: false,
            isBookmarked: false,
            visibility: 'public',
            tags: ['innovation', 'leadership', 'sustainability']
          },
          {
            id: 'post-4',
            author: {
              id: '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University',
              level: 5,
              nftBadges: ['Research Rockstar', 'Leadership Legend']
            },
            content: 'Mentorship milestone! 🌟 Just helped Alex Johnson (freshman) land their first research position. There\'s nothing more rewarding than watching someone unlock their potential. Always happy to help fellow students!',
            type: 'mentorship_milestone',
            timestamp: '2024-12-15T16:45:00Z',
            likes: 38,
            comments: 6,
            shares: 3,
            reactions: {
              like: 38,
              heart: 25,
              clap: 15,
              congratulations: 8
            },
            isLiked: false,
            isBookmarked: false,
            visibility: 'public',
            tags: ['mentorship', 'community', 'research']
          },
          {
            id: 'post-5',
            author: {
              id: 'user-emily-watson',
              name: 'Dr. Emily Watson',
              avatar: '/api/placeholder/avatar-emily.jpg',
              university: 'University of Michigan',
              level: 8,
              nftBadges: ['Research Rockstar', 'Innovation Titan', 'Mentor Master']
            },
            content: 'Academic NFTs are revolutionizing how we recognize and reward scholarly achievements! 💎 Seeing students get excited about their digital credentials is amazing. The gamification of education is the future.',
            type: 'insight_sharing',
            timestamp: '2024-12-14T09:20:00Z',
            likes: 156,
            comments: 28,
            shares: 22,
            reactions: {
              like: 156,
              mind_blown: 45,
              fire: 32,
              light_bulb: 28
            },
            isLiked: true,
            isBookmarked: true,
            visibility: 'public',
            tags: ['nft', 'education', 'innovation', 'future']
          }
        ],
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: 3,
          totalPosts: 25,
          hasNextPage: parseInt(page as string) < 3,
          hasPreviousPage: parseInt(page as string) > 1
        },
        stats: {
          totalLikes: 395,
          totalComments: 69,
          totalShares: 50,
          engagementRate: 85
        }
      });
    }

    // For new Supabase users, return empty feed
    return res.json({
      posts: [
        {
          id: 'welcome-post',
          author: {
            id: 'system',
            name: 'Academic NFT Marketplace',
            avatar: '/api/placeholder/system-avatar.png',
            university: 'System',
            level: 0,
            nftBadges: []
          },
          content: 'Welcome to the Academic NFT Marketplace social feed! 🎉 Start earning achievements to see your accomplishments celebrated here.',
          type: 'welcome',
          timestamp: new Date().toISOString(),
          likes: 0,
          comments: 0,
          shares: 0,
          reactions: {},
          isLiked: false,
          isBookmarked: false,
          visibility: 'public',
          tags: ['welcome']
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalPosts: 1,
        hasNextPage: false,
        hasPreviousPage: false
      },
      stats: {
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        engagementRate: 0
      }
    });

  } catch (error) {
    console.error('Social posts API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}