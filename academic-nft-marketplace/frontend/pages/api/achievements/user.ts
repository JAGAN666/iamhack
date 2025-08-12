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
    
    // For demo user, return sample achievements in the format the frontend expects
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json([
        {
          id: 'ach-1',
          title: 'Dean\'s List Achievement',
          description: 'Achieved Dean\'s List status for Fall 2024 semester with a 3.9 GPA',
          type: 'gpa',
          gpaValue: 3.9,
          proofUrl: '/api/placeholder/achievement-proof.pdf',
          verified: true,
          verifiedBy: 'Dr. Smith, Academic Advisor',
          verifiedAt: '2024-12-20T10:00:00Z',
          createdAt: '2024-12-15T00:00:00Z',
          updatedAt: '2024-12-20T10:00:00Z'
        },
        {
          id: 'ach-2',
          title: 'Research Publication',
          description: 'Co-authored research paper on Machine Learning applications published in IEEE Journal',
          type: 'research',
          proofUrl: '/api/placeholder/research-paper.pdf',
          verified: true,
          verifiedBy: 'Prof. Johnson, Research Supervisor',
          verifiedAt: '2024-12-05T14:30:00Z',
          createdAt: '2024-11-30T00:00:00Z',
          updatedAt: '2024-12-05T14:30:00Z'
        },
        {
          id: 'ach-3',
          title: 'Student Leadership Award',
          description: 'Recognized for outstanding leadership as President of Computer Science Club',
          type: 'leadership',
          proofUrl: '/api/placeholder/leadership-certificate.pdf',
          verified: true,
          verifiedBy: 'Student Affairs Office',
          verifiedAt: '2024-10-20T09:15:00Z',
          createdAt: '2024-10-15T00:00:00Z',
          updatedAt: '2024-10-20T09:15:00Z'
        },
        {
          id: 'ach-4',
          title: 'Hackathon Winner',
          description: 'First place winner at EMU TechHacks 2024 with innovative sustainability app',
          type: 'research',
          proofUrl: '/api/placeholder/hackathon-trophy.jpg',
          verified: true,
          verifiedBy: 'TechHacks Organizing Committee',
          verifiedAt: '2024-10-01T16:00:00Z',
          createdAt: '2024-09-28T00:00:00Z',
          updatedAt: '2024-10-01T16:00:00Z'
        },
        {
          id: 'ach-5',
          title: 'Academic Scholarship Recipient',
          description: 'Awarded merit-based scholarship for academic excellence and community service',
          type: 'gpa',
          gpaValue: 3.8,
          proofUrl: '/api/placeholder/scholarship-letter.pdf',
          verified: true,
          verifiedBy: 'Financial Aid Office',
          verifiedAt: '2024-08-25T11:30:00Z',
          createdAt: '2024-08-20T00:00:00Z',
          updatedAt: '2024-08-25T11:30:00Z'
        },
        {
          id: 'ach-6',
          title: 'Volunteer Excellence Award',
          description: 'Completed 200+ hours of community service tutoring underprivileged students',
          type: 'leadership',
          proofUrl: '/api/placeholder/volunteer-certificate.pdf',
          verified: true,
          verifiedBy: 'Community Service Center',
          verifiedAt: '2024-07-20T13:45:00Z',
          createdAt: '2024-07-15T00:00:00Z',
          updatedAt: '2024-07-20T13:45:00Z'
        },
        {
          id: 'ach-7',
          title: 'Innovation Challenge Runner-up',
          description: 'Second place in university-wide innovation challenge for sustainable technology',
          type: 'research',
          proofUrl: '/api/placeholder/innovation-project.pdf',
          verified: false,
          createdAt: '2024-06-30T00:00:00Z',
          updatedAt: '2024-06-30T00:00:00Z'
        },
        {
          id: 'ach-8',
          title: 'Language Proficiency Certificate',
          description: 'Achieved advanced proficiency in Spanish language with official certification',
          type: 'gpa',
          proofUrl: '/api/placeholder/language-cert.pdf',
          verified: true,
          verifiedBy: 'Language Testing Center',
          verifiedAt: '2024-05-20T10:00:00Z',
          createdAt: '2024-05-15T00:00:00Z',
          updatedAt: '2024-05-20T10:00:00Z'
        }
      ]);
    }

    // For new Supabase users, return empty achievements
    return res.json([]);

  } catch (error) {
    console.error('User achievements API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}