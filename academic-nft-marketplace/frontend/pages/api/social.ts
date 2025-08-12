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
    
    // For demo user, return rich social networking data
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json({
        profile: {
          social_score: 892,
          connections: 156,
          followers: 89,
          following: 67,
          influence_rank: 'Rising Influencer',
          networking_level: 4,
          social_nfts: 2,
          collaboration_score: 94
        },
        recent_activity: [
          {
            id: 'activity-1',
            type: 'achievement_unlock',
            timestamp: '2024-12-20T14:30:00Z',
            user: {
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University'
            },
            content: 'Unlocked Dean\'s List Achievement NFT! 🏆',
            reactions: {
              likes: 45,
              congratulations: 23,
              fire: 12
            },
            comments: 8,
            shares: 5
          },
          {
            id: 'activity-2',
            type: 'collaboration_success',
            timestamp: '2024-12-18T10:15:00Z',
            user: {
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University'
            },
            content: 'Successfully completed research collaboration with Sarah Chen from MIT! Our ML paper is now published 📚',
            reactions: {
              likes: 67,
              congratulations: 34,
              mind_blown: 18
            },
            comments: 12,
            shares: 8,
            collaboration_details: {
              partner: 'Sarah Chen',
              project: 'Machine Learning Applications in Healthcare',
              outcome: 'Published in IEEE Journal'
            }
          },
          {
            id: 'activity-3',
            type: 'mentorship_milestone',
            timestamp: '2024-12-15T16:45:00Z',
            user: {
              name: 'John Demo',
              avatar: '/api/placeholder/avatar-john.jpg',
              university: 'Eastern Michigan University'
            },
            content: 'Just helped Alex Johnson (freshman) land their first research position! Mentorship is so rewarding 🌟',
            reactions: {
              likes: 38,
              heart: 25,
              clap: 15
            },
            comments: 6,
            shares: 3
          }
        ],
        connections: [
          {
            id: 'conn-1',
            name: 'Sarah Chen',
            title: 'PhD Candidate - MIT AI Lab',
            university: 'Massachusetts Institute of Technology',
            avatar: '/api/placeholder/avatar-sarah.jpg',
            connection_strength: 95,
            shared_interests: ['Machine Learning', 'Research', 'AI Ethics'],
            collaboration_history: [
              'Co-authored research paper',
              'Joint conference presentation',
              'Peer review collaboration'
            ],
            nft_collection_overlap: 3,
            last_interaction: '2 days ago',
            mutual_connections: 12,
            available_for: ['Research collaboration', 'Mentorship', 'Networking']
          },
          {
            id: 'conn-2',
            name: 'Michael Rodriguez',
            title: 'Student Body President - Stanford',
            university: 'Stanford University',
            avatar: '/api/placeholder/avatar-michael.jpg',
            connection_strength: 88,
            shared_interests: ['Leadership', 'Innovation', 'Entrepreneurship'],
            collaboration_history: [
              'Joint leadership workshop',
              'Cross-university initiative'
            ],
            nft_collection_overlap: 2,
            last_interaction: '1 week ago',
            mutual_connections: 8,
            available_for: ['Leadership projects', 'Networking', 'Mentorship']
          },
          {
            id: 'conn-3',
            name: 'Dr. Emily Watson',
            title: 'Research Professor - University of Michigan',
            university: 'University of Michigan',
            avatar: '/api/placeholder/avatar-emily.jpg',
            connection_strength: 82,
            shared_interests: ['Academic Research', 'Publishing', 'Innovation'],
            collaboration_history: [
              'Research mentorship',
              'Grant application assistance'
            ],
            nft_collection_overlap: 1,
            last_interaction: '3 days ago',
            mutual_connections: 5,
            available_for: ['Research mentorship', 'Career guidance', 'References']
          }
        ],
        collaboration_opportunities: [
          {
            id: 'collab-1',
            title: 'Cross-University AI Ethics Research Project',
            description: 'Multi-institutional research on ethical AI implementations in healthcare',
            organizer: {
              name: 'Dr. Lisa Park',
              university: 'Harvard Medical School',
              avatar: '/api/placeholder/avatar-lisa.jpg'
            },
            participants_needed: 3,
            current_participants: 7,
            required_skills: ['Research experience', 'AI/ML knowledge', 'Ethics background'],
            match_percentage: 92,
            time_commitment: '10-15 hours/week',
            duration: '6 months',
            benefits: ['Publication opportunity', 'Research credit', 'Networking'],
            unlocked_by: ['Research Rockstar NFT'],
            application_deadline: '2025-02-15'
          },
          {
            id: 'collab-2',
            title: 'Student Leadership Innovation Challenge',
            description: 'Design solutions for enhancing student engagement across universities',
            organizer: {
              name: 'Campus Innovation Network',
              university: 'Multi-University Initiative',
              avatar: '/api/placeholder/avatar-network.jpg'
            },
            participants_needed: 5,
            current_participants: 12,
            required_skills: ['Leadership experience', 'Design thinking', 'Project management'],
            match_percentage: 89,
            time_commitment: '5-8 hours/week',
            duration: '3 months',
            benefits: ['$5000 prize pool', 'Leadership recognition', 'Implementation opportunity'],
            unlocked_by: ['Leadership Legend NFT'],
            application_deadline: '2025-01-30'
          }
        ],
        mentorship: {
          as_mentor: {
            active_mentees: 3,
            total_mentored: 8,
            success_stories: [
              'Alex Johnson - Secured first research position',
              'Maria Santos - Won innovation competition',
              'David Kim - Transferred to dream university'
            ],
            specialties: ['Research guidance', 'Academic planning', 'NFT strategy'],
            rating: 4.9,
            next_session: 'Tomorrow at 3:00 PM'
          },
          as_mentee: {
            current_mentors: 2,
            focus_areas: ['Advanced research methods', 'Career planning', 'Industry connections'],
            progress_tracking: {
              'Research skills': 85,
              'Professional network': 78,
              'Career readiness': 82
            },
            next_session: 'Friday at 2:00 PM'
          }
        },
        study_groups: [
          {
            id: 'group-1',
            name: 'Advanced Machine Learning Consortium',
            university: 'Cross-University',
            members: 24,
            focus: 'Deep Learning, NLP, Computer Vision',
            meeting_schedule: 'Wednesdays 7:00 PM EST',
            next_topic: 'Transformer Architecture Deep Dive',
            your_role: 'Co-organizer',
            access_level: 'Premium (NFT holder)',
            achievements_earned: 2
          },
          {
            id: 'group-2',
            name: 'Research Methods & Publishing',
            university: 'Eastern Michigan University',
            members: 12,
            focus: 'Academic writing, peer review, publication strategy',
            meeting_schedule: 'Fridays 4:00 PM EST',
            next_topic: 'Grant Writing Workshop',
            your_role: 'Member',
            access_level: 'Open',
            achievements_earned: 1
          }
        ],
        networking_events: [
          {
            id: 'event-1',
            title: 'Inter-University AI Research Symposium',
            date: '2025-03-15',
            time: '9:00 AM - 5:00 PM EST',
            format: 'Virtual + In-person',
            attendees: 250,
            universities: ['MIT', 'Stanford', 'Harvard', 'CMU', 'EMU'],
            your_status: 'Registered',
            access_level: 'VIP (Research Rockstar NFT)',
            benefits: ['Priority networking slots', 'Exclusive workshops', 'Publication opportunities'],
            cost: 'Free with NFT discount'
          },
          {
            id: 'event-2',
            title: 'Student Leadership Summit 2025',
            date: '2025-04-02',
            time: '10:00 AM - 6:00 PM EST',
            format: 'In-person - Chicago',
            attendees: 180,
            universities: ['Northwestern', 'University of Chicago', 'EMU', 'MSU'],
            your_status: 'Invited Speaker',
            access_level: 'VIP (Leadership Legend NFT)',
            benefits: ['Speaking opportunity', 'Premium networking', 'Travel stipend'],
            cost: 'Fully sponsored'
          }
        ],
        achievements_social_impact: {
          'Research Publication': {
            social_boost: '+15% connection acceptance rate',
            unlocks: ['Research collaboration networks', 'Academic mentorship opportunities'],
            networking_events: 8
          },
          'Leadership Award': {
            social_boost: '+20% mentorship requests',
            unlocks: ['Leadership circles', 'Executive mentorship', 'Speaking opportunities'],
            networking_events: 12
          },
          'Innovation Challenge Winner': {
            social_boost: '+25% collaboration invitations',
            unlocks: ['Innovation labs', 'Startup networks', 'Investor connections'],
            networking_events: 6
          }
        },
        social_nft_benefits: {
          active_bonuses: [
            'Research Rockstar: Access to exclusive academic networks',
            'Leadership Legend: Premium mentorship matching',
            'Innovation Titan: Startup founder introductions'
          ],
          networking_multipliers: {
            connection_rate: '+35%',
            collaboration_success: '+40%',
            mentorship_matching: '+50%',
            event_invitations: '+60%'
          }
        },
        recommendations: [
          {
            type: 'connection',
            priority: 'High',
            title: 'Connect with Dr. James Liu at CMU',
            description: 'Perfect match for your research interests in AI applications',
            match_score: 94,
            mutual_connections: 3,
            shared_projects_potential: 2
          },
          {
            type: 'collaboration',
            priority: 'Medium',
            title: 'Join the Quantum Computing Study Group',
            description: 'Emerging field with high collaboration potential',
            skill_development: ['Quantum algorithms', 'Research methods'],
            time_commitment: '3 hours/week'
          },
          {
            type: 'mentorship',
            priority: 'High',
            title: 'Offer mentorship to incoming freshmen',
            description: 'Your achievements make you an ideal mentor',
            impact: 'Build leadership portfolio + social NFT potential',
            estimated_mentees: 2
          }
        ]
      });
    }

    // For new Supabase users, return basic social data
    return res.json({
      profile: {
        social_score: 120,
        connections: 5,
        followers: 2,
        following: 8,
        influence_rank: 'Newcomer',
        networking_level: 1,
        social_nfts: 0,
        collaboration_score: 25
      },
      recent_activity: [
        {
          id: 'activity-welcome',
          type: 'welcome',
          timestamp: new Date().toISOString(),
          content: 'Welcome to the Academic NFT Marketplace! Start building your profile to unlock networking opportunities.',
          reactions: { likes: 0 },
          comments: 0
        }
      ],
      connections: [],
      collaboration_opportunities: [],
      mentorship: {
        as_mentor: { active_mentees: 0, total_mentored: 0 },
        as_mentee: { current_mentors: 0 }
      },
      study_groups: [],
      networking_events: [],
      achievements_social_impact: {},
      social_nft_benefits: { active_bonuses: [], networking_multipliers: {} },
      recommendations: [
        {
          type: 'profile',
          priority: 'High',
          title: 'Complete your first achievement',
          description: 'Unlock social features by earning your first achievement NFT'
        }
      ]
    });

  } catch (error) {
    console.error('Social API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}