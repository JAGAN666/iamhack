import { NextApiRequest, NextApiResponse } from 'next';

// Helper function to get user from authorization header
async function getUserFromAuth(req: NextApiRequest): Promise<any> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No valid authorization token provided');
  }

  const token = authHeader.split(' ')[1];
  
  // Check if it's a demo or test token (dynamic support)
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
    
    // For demo user, return sample NFT collection in expected format
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json([
        {
          id: 'nft-1',
          nftType: 'gpa_guardian',
          level: 3,
          rarity: 'rare',
          evolutionPoints: 750,
          minted: true,
          mintedAt: '2024-12-20T10:00:00Z',
          achievement: {
            title: 'Dean\'s List Achievement',
            type: 'academic',
            description: 'Achieved Dean\'s List status for Fall 2024 semester with a 3.9 GPA',
            verified: true
          }
        },
        {
          id: 'nft-2',
          nftType: 'research_rockstar',
          level: 4,
          rarity: 'epic',
          evolutionPoints: 1200,
          minted: true,
          mintedAt: '2024-12-05T14:30:00Z',
          achievement: {
            title: 'Research Publication',
            type: 'research',
            description: 'Co-authored research paper on Machine Learning applications published in IEEE Journal',
            verified: true
          }
        },
        {
          id: 'nft-3',
          nftType: 'leadership_legend',
          level: 4,
          rarity: 'epic',
          evolutionPoints: 1100,
          minted: true,
          mintedAt: '2024-10-20T09:15:00Z',
          achievement: {
            title: 'Student Leadership Award',
            type: 'leadership',
            description: 'Recognized for outstanding leadership as President of Computer Science Club',
            verified: true
          }
        },
        {
          id: 'nft-4',
          nftType: 'research_rockstar',
          level: 5,
          rarity: 'mythic',
          evolutionPoints: 2000,
          minted: true,
          mintedAt: '2024-10-01T16:00:00Z',
          achievement: {
            title: 'Hackathon Winner',
            type: 'research',
            description: 'First place winner at EMU TechHacks 2024 with innovative sustainability app',
            verified: true
          }
        },
        {
          id: 'nft-5',
          nftType: 'gpa_guardian',
          level: 3,
          rarity: 'rare',
          evolutionPoints: 800,
          minted: true,
          mintedAt: '2024-08-25T11:30:00Z',
          achievement: {
            title: 'Academic Scholarship Recipient',
            type: 'academic',
            description: 'Awarded merit-based scholarship for academic excellence and community service',
            verified: true
          }
        }
      ]);
    }

    // For new Supabase users, return empty NFT collection
    return res.json([]);

  } catch (error) {
    console.error('User NFTs API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}