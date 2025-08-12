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
    
    // For demo user, return accessible opportunities in the expected format
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json([
        {
          id: 'opp-1',
          title: 'AI Research Assistant - Machine Learning Lab',
          organization: 'MIT Computer Science Department',
          type: 'research_position',
          description: 'Join our cutting-edge machine learning research team working on next-generation AI algorithms',
          requirements: ['3.5+ GPA', 'Python proficiency', 'Machine Learning coursework'],
          compensation: '$25/hour',
          location: 'Cambridge, MA',
          deadline: '2025-09-15',
          tags: ['AI', 'Research', 'Machine Learning', 'Python'],
          matchScore: 95,
          unlocked: true,
          unlockedBy: ['Research Rockstar NFT'],
          difficulty: 'Advanced',
          timeCommitment: '20 hours/week',
          applicationUrl: 'https://mit.edu/apply/research-1',
          contactEmail: 'schen@mit.edu',
          benefits: ['Research publication opportunities', 'Graduate school preparation', 'Industry networking'],
          createdAt: '2024-12-01T00:00:00Z',
          updatedAt: '2024-12-10T15:30:00Z'
        },
        {
          id: 'opp-2',
          title: 'Tech Innovation Scholarship',
          organization: 'Google Education Foundation',
          type: 'scholarship',
          description: 'Supporting innovative students in computer science and engineering',
          requirements: ['3.7+ GPA', 'Innovation project', 'Leadership experience'],
          compensation: '$10,000',
          location: 'Remote',
          deadline: '2025-10-01',
          tags: ['Technology', 'Innovation', 'Merit-based', 'Scholarship'],
          matchScore: 92,
          unlocked: true,
          unlockedBy: ['GPA Guardian NFT', 'Leadership Legend NFT'],
          difficulty: 'Competitive',
          applicationUrl: 'https://google.org/scholarships/tech-innovation',
          renewable: true,
          benefits: ['Mentorship program', 'Industry connections', 'Career guidance'],
          createdAt: '2024-11-15T00:00:00Z',
          updatedAt: '2024-12-05T09:20:00Z'
        },
        {
          id: 'opp-3',
          title: 'Software Engineering Intern',
          organization: 'Meta (Facebook)',
          type: 'internship',
          description: 'Build products used by billions of people worldwide',
          requirements: ['Strong programming skills', 'CS major', 'Leadership experience'],
          compensation: '$8,000/month + housing',
          location: 'Menlo Park, CA',
          deadline: '2025-02-01',
          tags: ['Software', 'Engineering', 'Tech', 'Programming'],
          matchScore: 89,
          unlocked: true,
          unlockedBy: ['Research Rockstar NFT', 'Leadership Legend NFT'],
          difficulty: 'Highly Competitive',
          timeCommitment: '40 hours/week for 12 weeks',
          applicationUrl: 'https://careers.meta.com/internships/software',
          contactEmail: 'university@meta.com',
          benefits: ['Full-time offer potential', 'Mentorship', 'Housing stipend'],
          createdAt: '2024-11-01T00:00:00Z',
          updatedAt: '2024-12-08T14:45:00Z'
        },
        {
          id: 'opp-4',
          title: 'Student Leadership Summit 2025',
          organization: 'National Student Leadership Council',
          type: 'conference',
          description: 'Premier leadership development conference for university students',
          requirements: ['Leadership experience', 'University enrollment'],
          compensation: 'Free + Travel stipend',
          location: 'Chicago, IL',
          deadline: '2025-03-01',
          tags: ['Leadership', 'Networking', 'Development', 'Conference'],
          matchScore: 87,
          unlocked: true,
          unlockedBy: ['Leadership Legend NFT'],
          difficulty: 'Selective',
          timeCommitment: '3 days',
          applicationUrl: 'https://nslc.org/summit-2025',
          benefits: ['Leadership certification', 'Networking opportunities', 'Speaking experience'],
          createdAt: '2024-10-20T00:00:00Z',
          updatedAt: '2024-12-01T11:15:00Z'
        }
      ]);
    }

    // For new Supabase users, return basic accessible opportunities
    return res.json([
      {
        id: 'basic-1',
        title: 'Intro Programming Workshop',
        organization: 'Local Community College',
        type: 'workshop',
        description: 'Learn the basics of programming',
        requirements: ['No experience needed'],
        compensation: 'Free',
        location: 'Online',
        deadline: '2025-12-31',
        tags: ['Programming', 'Beginner'],
        matchScore: 65,
        unlocked: true,
        unlockedBy: [],
        difficulty: 'Beginner'
      }
    ]);

  } catch (error) {
    console.error('Accessible opportunities API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}