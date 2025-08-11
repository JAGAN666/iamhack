import { NextApiRequest, NextApiResponse } from 'next';

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

  // Return sample events data
  const events = [
    {
      id: '1',
      title: 'Future of Academic Research Conference',
      description: 'Join leading researchers and academics to explore cutting-edge developments in academic research methodologies and emerging technologies.',
      fullDescription: 'This comprehensive conference brings together the brightest minds in academia to discuss the future of research.',
      date: '2025-09-15',
      time: '9:00 AM - 5:00 PM',
      location: 'Harvard University, Cambridge, MA',
      price: 75,
      maxAttendees: 500,
      currentAttendees: 342,
      image: '/api/placeholder/600/400',
      nftDiscounts: {
        gpa_guardian: 20,
        research_rockstar: 100,
        leadership_legend: 30
      },
      tags: ['Research', 'Academic', 'Technology'],
      organizer: 'Harvard Research Institute',
      status: 'active'
    },
    {
      id: '2',
      title: 'Student Leadership Summit 2025',
      description: 'Develop your leadership skills with workshops, networking sessions, and talks from successful student leaders across universities.',
      date: '2025-08-22',
      time: '10:00 AM - 6:00 PM',
      location: 'Stanford University, Palo Alto, CA',
      price: 45,
      maxAttendees: 300,
      currentAttendees: 178,
      image: '/api/placeholder/600/400',
      nftDiscounts: {
        gpa_guardian: 15,
        research_rockstar: 20,
        leadership_legend: 100
      },
      tags: ['Leadership', 'Networking', 'Development'],
      organizer: 'Stanford Student Leadership Council',
      status: 'active'
    },
    {
      id: '3',
      title: 'Cross-University Networking Night',
      description: 'Connect with students, alumni, and professionals from partner universities. Perfect for building your academic and professional network.',
      date: '2025-08-30',
      time: '6:00 PM - 9:00 PM',
      location: 'MIT Campus, Boston, MA',
      price: 25,
      maxAttendees: 200,
      currentAttendees: 89,
      image: '/api/placeholder/600/400',
      nftDiscounts: {
        gpa_guardian: 20,
        research_rockstar: 30,
        leadership_legend: 40
      },
      tags: ['Networking', 'Social', 'Career'],
      organizer: 'Inter-University Alliance',
      status: 'active'
    }
  ];

  return res.json(events);
}