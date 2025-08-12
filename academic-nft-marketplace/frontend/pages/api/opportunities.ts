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
    
    // For demo user, return opportunities in array format expected by frontend
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json([
        {
          id: 'research-1',
          title: 'AI Research Assistant - Machine Learning Lab',
          description: 'Join our cutting-edge machine learning research team working on next-generation AI algorithms.',
          type: 'research_position',
          category: 'digital',
          requiredNFTs: ['Research Rockstar'],
          hasAccess: true,
          accessible: true,
          accessReason: 'Your Research Rockstar NFT unlocks this opportunity',
          company: 'MIT Computer Science Department',
          location: 'Cambridge, MA',
          startDate: '2025-09-15',
          salary: '$25/hour',
          url: 'https://mit.edu/apply/research-1',
          featured: true
        },
        {
          id: 'research-2',
          title: 'Sustainability Research Fellowship',
          description: 'Prestigious fellowship for innovative sustainability research projects.',
          type: 'fellowship',
          category: 'digital',
          requiredNFTs: ['Research Rockstar'],
          hasAccess: true,
          accessible: true,
          company: 'Stanford Environmental Institute',
          location: 'Stanford, CA',
          startDate: '2025-08-30',
          salary: '$3000/month + benefits',
          url: 'https://stanford.edu/apply/sustainability-fellowship'
        },
        {
          id: 'scholarship-1',
          title: 'Tech Innovation Scholarship',
          description: 'Supporting innovative students in computer science and engineering.',
          type: 'scholarship',
          category: 'digital',
          requiredNFTs: ['GPA Guardian', 'Leadership Legend'],
          hasAccess: true,
          accessible: true,
          company: 'Google Education Foundation',
          location: 'Remote',
          startDate: '2025-10-01',
          salary: '$10,000',
          url: 'https://google.org/scholarships/tech-innovation',
          featured: true
        },
        {
          id: 'internship-1',
          title: 'Software Engineering Intern',
          description: 'Build products used by billions of people worldwide.',
          type: 'internship',
          category: 'digital',
          requiredNFTs: ['Research Rockstar', 'Leadership Legend'],
          hasAccess: true,
          accessible: true,
          company: 'Meta (Facebook)',
          location: 'Menlo Park, CA',
          startDate: '2025-02-01',
          salary: '$8,000/month + housing',
          url: 'https://careers.meta.com/internships/software',
          urgent: true
        },
        {
          id: 'competition-1',
          title: 'International Programming Championship',
          description: 'Premier global programming competition for university students.',
          type: 'competition',
          category: 'physical',
          requiredNFTs: ['Research Rockstar'],
          hasAccess: true,
          accessible: true,
          company: 'ACM-ICPC',
          location: 'Tokyo, Japan',
          startDate: '2025-03-01',
          salary: '$15,000 first place + travel',
          url: 'https://icpc.global/worldfinals'
        }
      ]);
    }

    // For new Supabase users, return basic opportunities
    return res.json([
      {
        id: 'basic-1',
        title: 'Intro Programming Workshop',
        description: 'Learn the basics of programming',
        type: 'workshop',
        category: 'digital',
        requiredNFTs: [],
        hasAccess: true,
        accessible: true,
        company: 'Local Community College',
        location: 'Online',
        startDate: '2025-12-31',
        salary: 'Free'
      }
    ]);

  } catch (error) {
    console.error('Opportunities API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}