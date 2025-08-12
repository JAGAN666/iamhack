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
    
    // For demo user, return sample NFT collection
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json([
        {
          id: 'nft-1',
          achievement_id: 'ach-1',
          token_id: 'NFT-001',
          name: 'GPA Guardian - Elite Scholar',
          description: 'A shimmering academic achievement NFT representing Dean\'s List excellence. This rare collectible showcases mathematical prowess and academic dedication.',
          type: 'gpa_guardian',
          rarity: 'Rare',
          level: 3,
          experience: 750,
          attributes: {
            intelligence: 95,
            dedication: 92,
            academic_excellence: 98,
            mathematical_skills: 94,
            study_efficiency: 89,
            special_abilities: ['Knowledge Amplifier', 'Study Streak Multiplier']
          },
          image_url: '/api/placeholder/nft-gpa-guardian.png',
          animation_url: '/api/placeholder/nft-gpa-animation.mp4',
          staking_rewards: 15.50,
          market_value: 0.075,
          created_at: '2024-12-20T10:00:00Z',
          last_evolution: '2024-12-20T10:00:00Z',
          evolution_stage: 'Elite',
          unlock_perks: ['20% discount on academic events', 'Priority registration', 'Exclusive study groups'],
          battle_stats: {
            power: 850,
            defense: 720,
            speed: 680,
            magic: 940
          }
        },
        {
          id: 'nft-2',
          achievement_id: 'ach-2',
          token_id: 'NFT-002',
          name: 'Research Rockstar - Innovation Master',
          description: 'An epic research achievement NFT pulsing with intellectual energy. Represents groundbreaking contributions to machine learning research.',
          type: 'research_rockstar',
          rarity: 'Epic',
          level: 4,
          experience: 1200,
          attributes: {
            innovation: 98,
            research_skills: 96,
            analytical_thinking: 94,
            publication_impact: 97,
            collaboration: 88,
            special_abilities: ['Research Accelerator', 'Innovation Catalyst', 'Peer Review Master']
          },
          image_url: '/api/placeholder/nft-research-rockstar.png',
          animation_url: '/api/placeholder/nft-research-animation.mp4',
          staking_rewards: 28.75,
          market_value: 0.125,
          created_at: '2024-12-05T14:30:00Z',
          last_evolution: '2024-12-05T14:30:00Z',
          evolution_stage: 'Master',
          unlock_perks: ['Research lab access', '100% discount on research events', 'Mentorship opportunities'],
          battle_stats: {
            power: 1100,
            defense: 850,
            speed: 790,
            magic: 1250
          }
        },
        {
          id: 'nft-3',
          achievement_id: 'ach-3',
          token_id: 'NFT-003',
          name: 'Leadership Legend - Community Champion',
          description: 'A legendary leadership NFT radiating charismatic energy. Embodies exceptional leadership qualities and community impact.',
          type: 'leadership_legend',
          rarity: 'Epic',
          level: 4,
          experience: 1100,
          attributes: {
            leadership: 96,
            communication: 93,
            team_building: 91,
            project_management: 89,
            inspiration: 95,
            special_abilities: ['Team Synergy Boost', 'Motivation Aura', 'Strategic Vision']
          },
          image_url: '/api/placeholder/nft-leadership-legend.png',
          animation_url: '/api/placeholder/nft-leadership-animation.mp4',
          staking_rewards: 25.30,
          market_value: 0.110,
          created_at: '2024-10-20T09:15:00Z',
          last_evolution: '2024-10-20T09:15:00Z',
          evolution_stage: 'Champion',
          unlock_perks: ['Leadership workshops', 'Networking events', '30% discount on all events'],
          battle_stats: {
            power: 950,
            defense: 1050,
            speed: 920,
            magic: 880
          }
        },
        {
          id: 'nft-4',
          achievement_id: 'ach-4',
          token_id: 'NFT-004',
          name: 'Innovation Titan - Legendary Creator',
          description: 'The rarest hackathon champion NFT with mythical properties. Represents the pinnacle of creative problem-solving and technical excellence.',
          type: 'research_rockstar',
          rarity: 'Legendary',
          level: 5,
          experience: 2000,
          attributes: {
            creativity: 99,
            technical_skills: 97,
            problem_solving: 98,
            innovation: 99,
            teamwork: 94,
            special_abilities: ['Innovation Storm', 'Code Mastery', 'Solution Architect', 'Team Catalyst']
          },
          image_url: '/api/placeholder/nft-innovation-titan.png',
          animation_url: '/api/placeholder/nft-innovation-animation.mp4',
          staking_rewards: 50.00,
          market_value: 0.250,
          created_at: '2024-10-01T16:00:00Z',
          last_evolution: '2024-10-01T16:00:00Z',
          evolution_stage: 'Legendary',
          unlock_perks: ['Hackathon mentorship', 'Startup incubator access', 'Free premium events', 'Industry connections'],
          battle_stats: {
            power: 1500,
            defense: 1200,
            speed: 1350,
            magic: 1600
          }
        },
        {
          id: 'nft-5',
          achievement_id: 'ach-5',
          token_id: 'NFT-005',
          name: 'GPA Guardian - Scholarship Sage',
          description: 'A prestigious scholarship NFT glowing with academic excellence. Represents both merit and community service dedication.',
          type: 'gpa_guardian',
          rarity: 'Rare',
          level: 3,
          experience: 800,
          attributes: {
            academic_merit: 96,
            community_service: 88,
            leadership_potential: 85,
            financial_wisdom: 82,
            social_impact: 90,
            special_abilities: ['Scholarship Magnet', 'Service Multiplier']
          },
          image_url: '/api/placeholder/nft-scholarship-sage.png',
          animation_url: '/api/placeholder/nft-scholarship-animation.mp4',
          staking_rewards: 18.25,
          market_value: 0.085,
          created_at: '2024-08-25T11:30:00Z',
          last_evolution: '2024-08-25T11:30:00Z',
          evolution_stage: 'Sage',
          unlock_perks: ['Scholarship opportunities', 'Financial aid priority', '15% discount on events'],
          battle_stats: {
            power: 780,
            defense: 920,
            speed: 640,
            magic: 850
          }
        }
      ]);
    }

    // For new Supabase users, return empty NFT collection
    return res.json([]);

  } catch (error) {
    console.error('NFTs API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}