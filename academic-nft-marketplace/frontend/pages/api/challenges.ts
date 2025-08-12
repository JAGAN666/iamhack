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
    
    // For demo user, return comprehensive challenges data
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json({
        challenges: [
          {
            id: 'challenge-1',
            title: '🏆 Research Rockstar Challenge',
            description: 'Publish a peer-reviewed research paper and earn the ultimate academic NFT',
            type: 'achievement',
            difficulty: 'Advanced',
            reward: 'Research Legend NFT + 1000 XP',
            participants: 245,
            duration: '3 months',
            deadline: '2025-03-15',
            requirements: ['Active student status', 'Research experience', 'Academic mentor'],
            nft_reward: 'Research Legend NFT',
            xp_reward: 1000,
            status: 'active',
            category: 'Research',
            entry_requirements: ['GPA 3.5+', 'Research background']
          },
          {
            id: 'challenge-2',
            title: '⚔️ Academic Battle Royale',
            description: 'Compete in weekly knowledge battles across multiple disciplines',
            type: 'battle',
            difficulty: 'Intermediate',
            reward: 'Battle Champion Badge + 500 XP',
            participants: 892,
            max_participants: 1000,
            duration: '1 week',
            deadline: '2025-08-18',
            requirements: ['Verified student', 'At least 1 achievement NFT'],
            xp_reward: 500,
            status: 'active',
            category: 'Competition'
          },
          {
            id: 'challenge-3',
            title: '🚀 Innovation Sprint',
            description: 'Create a solution to a real-world problem in 48 hours',
            type: 'tournament',
            difficulty: 'Expert',
            reward: '$5,000 Prize Pool + Innovation NFT',
            participants: 156,
            max_participants: 200,
            duration: '48 hours',
            deadline: '2025-09-01',
            requirements: ['Team of 2-4', 'Technical skills', 'Presentation ready'],
            nft_reward: 'Innovation Master NFT',
            xp_reward: 750,
            status: 'upcoming',
            category: 'Innovation'
          },
          {
            id: 'challenge-4',
            title: '🤝 Cross-University Collaboration',
            description: 'Partner with students from different universities on joint projects',
            type: 'collaboration',
            difficulty: 'Beginner',
            reward: 'Collaboration Master Badge + 300 XP',
            participants: 324,
            duration: '2 months',
            deadline: '2025-10-01',
            requirements: ['Open to collaboration', 'Communication skills'],
            xp_reward: 300,
            status: 'active',
            category: 'Networking'
          },
          {
            id: 'challenge-5',
            title: '🎨 Creative Expression Challenge',
            description: 'Showcase your creative skills through digital art, writing, or multimedia',
            type: 'achievement',
            difficulty: 'Intermediate',
            reward: 'Creative Genius NFT + 400 XP',
            participants: 178,
            duration: '1 month',
            deadline: '2025-08-30',
            requirements: ['Original work', 'Creative portfolio'],
            nft_reward: 'Creative Genius NFT',
            xp_reward: 400,
            status: 'active',
            category: 'Arts'
          },
          {
            id: 'challenge-6',
            title: '🧠 AI Ethics Symposium Challenge',
            description: 'Research and present on AI ethics and responsible technology',
            type: 'tournament',
            difficulty: 'Advanced',
            reward: 'Ethics Scholar NFT + Conference Speaking Slot',
            participants: 89,
            max_participants: 100,
            duration: '6 weeks',
            deadline: '2025-09-15',
            requirements: ['Ethics background', 'Research skills', 'Presentation ability'],
            nft_reward: 'Ethics Scholar NFT',
            xp_reward: 800,
            status: 'upcoming',
            category: 'Ethics'
          }
        ],
        tournaments: [
          {
            id: 'tournament-1',
            name: '🏆 Global Academic Championship 2025',
            description: 'The ultimate academic competition bringing together top students worldwide',
            participants: 2847,
            prize_pool: '$50,000',
            start_date: '2025-09-01',
            end_date: '2025-09-30',
            status: 'registration',
            categories: ['Research', 'Innovation', 'Leadership', 'Creative Arts']
          },
          {
            id: 'tournament-2',
            name: '⚡ Lightning Research Sprint',
            description: 'Fast-paced research competition with instant feedback and scoring',
            participants: 1205,
            prize_pool: '$15,000',
            start_date: '2025-08-20',
            end_date: '2025-08-22',
            status: 'active',
            categories: ['Quick Research', 'Data Analysis', 'Problem Solving']
          },
          {
            id: 'tournament-3',
            name: '🌟 Future Leaders Summit',
            description: 'Leadership challenges and networking opportunities for emerging leaders',
            participants: 456,
            prize_pool: 'Mentorship + Internship Opportunities',
            start_date: '2025-10-15',
            end_date: '2025-10-17',
            status: 'upcoming',
            categories: ['Leadership', 'Public Speaking', 'Team Management']
          }
        ],
        user_participation: {
          active_challenges: ['challenge-2', 'challenge-4'],
          completed_challenges: ['challenge-old-1'],
          tournament_registrations: ['tournament-1'],
          total_xp_earned: 1850,
          current_rank: 'Battle Veteran',
          achievements_unlocked: 5
        },
        leaderboard: {
          top_challengers: [
            {
              rank: 1,
              name: 'Sarah Chen',
              university: 'MIT',
              total_xp: 4250,
              challenges_completed: 12,
              tournaments_won: 3
            },
            {
              rank: 2,
              name: 'John Demo',
              university: 'Eastern Michigan University',
              total_xp: 3890,
              challenges_completed: 8,
              tournaments_won: 2
            },
            {
              rank: 3,
              name: 'Michael Rodriguez',
              university: 'Stanford',
              total_xp: 3650,
              challenges_completed: 10,
              tournaments_won: 1
            }
          ]
        },
        upcoming_deadlines: [
          {
            challenge_id: 'challenge-2',
            title: 'Academic Battle Royale',
            deadline: '2025-08-18',
            days_remaining: 6
          },
          {
            challenge_id: 'challenge-5',
            title: 'Creative Expression Challenge',
            deadline: '2025-08-30',
            days_remaining: 18
          }
        ]
      });
    }

    // For new Supabase users, return basic challenges data
    return res.json({
      challenges: [
        {
          id: 'beginner-challenge-1',
          title: '🎯 First Achievement Challenge',
          description: 'Upload your first academic achievement to get started',
          type: 'achievement',
          difficulty: 'Beginner',
          reward: 'Starter Badge + 100 XP',
          participants: 45,
          duration: '1 week',
          deadline: '2025-08-25',
          requirements: ['Student status verification'],
          xp_reward: 100,
          status: 'active',
          category: 'Getting Started'
        },
        {
          id: 'beginner-challenge-2',
          title: '🤝 Make Your First Connection',
          description: 'Connect with another student to unlock networking features',
          type: 'collaboration',
          difficulty: 'Beginner',
          reward: 'Social Butterfly Badge + 50 XP',
          participants: 123,
          duration: '2 weeks',
          deadline: '2025-09-01',
          requirements: ['Complete profile'],
          xp_reward: 50,
          status: 'active',
          category: 'Networking'
        }
      ],
      tournaments: [],
      user_participation: {
        active_challenges: [],
        completed_challenges: [],
        tournament_registrations: [],
        total_xp_earned: 0,
        current_rank: 'Newcomer',
        achievements_unlocked: 0
      },
      leaderboard: {
        top_challengers: []
      },
      upcoming_deadlines: []
    });

  } catch (error) {
    console.error('Challenges API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}