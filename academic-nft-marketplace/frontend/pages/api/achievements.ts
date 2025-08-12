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

  // For now, return a basic user object for Supabase tokens
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
    
    // For demo user, return sample achievements
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json([
        {
          id: 'ach-1',
          title: 'Dean\'s List Achievement',
          description: 'Achieved Dean\'s List status for Fall 2024 semester with a 3.9 GPA',
          type: 'academic',
          category: 'Academic Excellence',
          date_achieved: '2024-12-15',
          status: 'verified',
          proof_url: '/api/placeholder/achievement-proof.pdf',
          nft_minted: true,
          nft_token_id: 'NFT-001',
          verified_by: 'Dr. Smith, Academic Advisor',
          verification_date: '2024-12-20T10:00:00Z',
          skill_tags: ['Academic Excellence', 'Mathematics', 'Research'],
          confidence_score: 0.95,
          rarity: 'Rare',
          level: 3
        },
        {
          id: 'ach-2',
          title: 'Research Publication',
          description: 'Co-authored research paper on Machine Learning applications published in IEEE Journal',
          type: 'research',
          category: 'Research & Innovation',
          date_achieved: '2024-11-30',
          status: 'verified',
          proof_url: '/api/placeholder/research-paper.pdf',
          nft_minted: true,
          nft_token_id: 'NFT-002',
          verified_by: 'Prof. Johnson, Research Supervisor',
          verification_date: '2024-12-05T14:30:00Z',
          skill_tags: ['Research', 'Machine Learning', 'Academic Writing'],
          confidence_score: 0.98,
          rarity: 'Epic',
          level: 4
        },
        {
          id: 'ach-3',
          title: 'Student Leadership Award',
          description: 'Recognized for outstanding leadership as President of Computer Science Club',
          type: 'leadership',
          category: 'Leadership & Service',
          date_achieved: '2024-10-15',
          status: 'verified',
          proof_url: '/api/placeholder/leadership-certificate.pdf',
          nft_minted: true,
          nft_token_id: 'NFT-003',
          verified_by: 'Student Affairs Office',
          verification_date: '2024-10-20T09:15:00Z',
          skill_tags: ['Leadership', 'Communication', 'Project Management'],
          confidence_score: 0.92,
          rarity: 'Epic',
          level: 4
        },
        {
          id: 'ach-4',
          title: 'Hackathon Winner',
          description: 'First place winner at EMU TechHacks 2024 with innovative sustainability app',
          type: 'extracurricular',
          category: 'Innovation & Technology',
          date_achieved: '2024-09-28',
          status: 'verified',
          proof_url: '/api/placeholder/hackathon-trophy.jpg',
          nft_minted: true,
          nft_token_id: 'NFT-004',
          verified_by: 'TechHacks Organizing Committee',
          verification_date: '2024-10-01T16:00:00Z',
          skill_tags: ['Programming', 'Innovation', 'Teamwork'],
          confidence_score: 0.97,
          rarity: 'Legendary',
          level: 5
        },
        {
          id: 'ach-5',
          title: 'Academic Scholarship Recipient',
          description: 'Awarded merit-based scholarship for academic excellence and community service',
          type: 'academic',
          category: 'Scholarships & Awards',
          date_achieved: '2024-08-20',
          status: 'verified',
          proof_url: '/api/placeholder/scholarship-letter.pdf',
          nft_minted: true,
          nft_token_id: 'NFT-005',
          verified_by: 'Financial Aid Office',
          verification_date: '2024-08-25T11:30:00Z',
          skill_tags: ['Academic Excellence', 'Community Service'],
          confidence_score: 0.94,
          rarity: 'Rare',
          level: 3
        },
        {
          id: 'ach-6',
          title: 'Volunteer Excellence Award',
          description: 'Completed 200+ hours of community service tutoring underprivileged students',
          type: 'extracurricular',
          category: 'Community Service',
          date_achieved: '2024-07-15',
          status: 'verified',
          proof_url: '/api/placeholder/volunteer-certificate.pdf',
          nft_minted: false,
          verified_by: 'Community Service Center',
          verification_date: '2024-07-20T13:45:00Z',
          skill_tags: ['Community Service', 'Teaching', 'Mentoring'],
          confidence_score: 0.89,
          rarity: 'Common',
          level: 2
        },
        {
          id: 'ach-7',
          title: 'Innovation Challenge Runner-up',
          description: 'Second place in university-wide innovation challenge for sustainable technology',
          type: 'research',
          category: 'Innovation & Technology',
          date_achieved: '2024-06-30',
          status: 'pending',
          proof_url: '/api/placeholder/innovation-project.pdf',
          nft_minted: false,
          skill_tags: ['Innovation', 'Sustainability', 'Technology'],
          confidence_score: 0.91,
          rarity: 'Rare',
          level: 3
        },
        {
          id: 'ach-8',
          title: 'Language Proficiency Certificate',
          description: 'Achieved advanced proficiency in Spanish language with official certification',
          type: 'academic',
          category: 'Language & International',
          date_achieved: '2024-05-15',
          status: 'verified',
          proof_url: '/api/placeholder/language-cert.pdf',
          nft_minted: false,
          verified_by: 'Language Testing Center',
          verification_date: '2024-05-20T10:00:00Z',
          skill_tags: ['Language', 'Communication', 'Cultural Competency'],
          confidence_score: 0.96,
          rarity: 'Common',
          level: 2
        }
      ]);
    }

    // For new Supabase users, return empty achievements
    return res.json([]);

  } catch (error) {
    console.error('Achievements API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}