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
    
    // For demo user, return comprehensive career data
    if (user.id === '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9') {
      return res.json({
        career_insights: {
          recommended_paths: [
            {
              id: 'path-1',
              title: 'AI/Machine Learning Engineer',
              match_percentage: 94,
              salary_range: '$120,000 - $200,000',
              growth_potential: 'High',
              demand_level: 'Very High',
              description: 'Build intelligent systems and algorithms that learn from data',
              key_skills: ['Python', 'TensorFlow', 'PyTorch', 'Statistics', 'Deep Learning'],
              education_path: ['Computer Science degree', 'ML Specialization', 'Advanced Mathematics'],
              companies: ['Google', 'OpenAI', 'Meta', 'Tesla', 'Microsoft'],
              achievement_alignment: ['Research Publication', 'Innovation Awards'],
              nft_bonuses: ['Research Rockstar gives 15% interview boost'],
              next_steps: ['Complete ML certification', 'Build AI portfolio projects', 'Contribute to open source'],
              timeline: '2-3 years to senior role'
            },
            {
              id: 'path-2',
              title: 'Research Scientist',
              match_percentage: 91,
              salary_range: '$110,000 - $180,000',
              growth_potential: 'High',
              demand_level: 'High',
              description: 'Conduct cutting-edge research in academic or industrial settings',
              key_skills: ['Research Methodology', 'Statistical Analysis', 'Publication Writing', 'Grant Writing'],
              education_path: ['PhD in relevant field', 'Postdoctoral research', 'Research experience'],
              companies: ['MIT', 'Stanford', 'Microsoft Research', 'Google Research', 'IBM Research'],
              achievement_alignment: ['Research Publication', 'Academic Excellence'],
              nft_bonuses: ['Research Rockstar unlocks exclusive research positions'],
              next_steps: ['Apply to PhD programs', 'Publish more papers', 'Attend research conferences'],
              timeline: '5-7 years to independent researcher'
            },
            {
              id: 'path-3',
              title: 'Technology Product Manager',
              match_percentage: 87,
              salary_range: '$130,000 - $220,000',
              growth_potential: 'Very High',
              demand_level: 'High',
              description: 'Lead product development and strategy for technology companies',
              key_skills: ['Product Strategy', 'Project Management', 'User Experience', 'Data Analysis'],
              education_path: ['Business/Technical degree', 'Product Management experience', 'Leadership roles'],
              companies: ['Apple', 'Google', 'Amazon', 'Microsoft', 'Stripe'],
              achievement_alignment: ['Leadership Awards', 'Innovation Projects'],
              nft_bonuses: ['Leadership Legend provides networking advantages'],
              next_steps: ['Product management internship', 'Build product portfolio', 'Develop business acumen'],
              timeline: '3-5 years to senior PM role'
            }
          ],
          skill_gaps: [
            {
              skill: 'Advanced Machine Learning',
              current_level: 70,
              target_level: 90,
              importance: 'Critical',
              resources: ['Coursera ML Specialization', 'Kaggle competitions', 'Research projects'],
              estimated_time: '6 months'
            },
            {
              skill: 'Leadership & Management',
              current_level: 80,
              target_level: 95,
              importance: 'High',
              resources: ['Leadership workshops', 'Team project leadership', 'Mentorship programs'],
              estimated_time: '1 year'
            },
            {
              skill: 'Business Strategy',
              current_level: 45,
              target_level: 75,
              importance: 'Medium',
              resources: ['Business courses', 'Product management books', 'Case study analysis'],
              estimated_time: '8 months'
            }
          ]
        },
        industry_trends: [
          {
            id: 'trend-1',
            category: 'Artificial Intelligence',
            trend_name: 'Generative AI Revolution',
            impact_level: 'Transformative',
            growth_rate: '+150% YoY',
            description: 'Generative AI is reshaping every industry from content creation to drug discovery',
            opportunities: ['AI Engineer', 'ML Researcher', 'AI Product Manager', 'AI Ethics Specialist'],
            skills_in_demand: ['Large Language Models', 'Prompt Engineering', 'AI Safety', 'Multimodal AI'],
            salary_impact: '+25% premium for AI skills',
            timeline: 'Mainstream adoption in 2-3 years'
          },
          {
            id: 'trend-2',
            category: 'Sustainability Tech',
            trend_name: 'Climate Technology Boom',
            impact_level: 'High',
            growth_rate: '+75% YoY',
            description: 'Massive investment in clean energy, carbon capture, and sustainable solutions',
            opportunities: ['ClimaTech Engineer', 'Sustainability Analyst', 'Green Finance Specialist'],
            skills_in_demand: ['Clean Energy Systems', 'Carbon Accounting', 'ESG Analysis'],
            salary_impact: '+15% for sustainability focus',
            timeline: 'Rapid growth over next 5 years'
          }
        ],
        networking_opportunities: [
          {
            id: 'network-1',
            title: 'AI Research Alumni Network',
            description: 'Connect with 500+ alumni working in AI research at top companies',
            members: 523,
            unlocked_by: ['Research Rockstar NFT'],
            access_level: 'Premium',
            benefits: ['Mentorship matching', 'Job referrals', 'Research collaboration'],
            next_event: 'Virtual AI Career Panel - March 15, 2025'
          },
          {
            id: 'network-2',
            title: 'Student Leadership Circle',
            description: 'Elite network of student leaders across top universities',
            members: 250,
            unlocked_by: ['Leadership Legend NFT'],
            access_level: 'Exclusive',
            benefits: ['Leadership workshops', 'Executive mentorship', 'Startup opportunities'],
            next_event: 'Leadership Summit - April 2, 2025'
          }
        ],
        market_analysis: {
          tech_sector: {
            job_growth: '+22% next 5 years',
            avg_salary: '$125,000',
            top_skills: ['Python', 'Machine Learning', 'Cloud Computing', 'Data Science'],
            hot_locations: ['San Francisco', 'Seattle', 'New York', 'Austin', 'Remote']
          },
          research_sector: {
            job_growth: '+15% next 5 years',
            avg_salary: '$95,000',
            top_skills: ['Data Analysis', 'Research Methods', 'Grant Writing', 'Publications'],
            hot_locations: ['Boston', 'Research Triangle', 'San Francisco', 'University towns']
          }
        },
        personalized_recommendations: [
          {
            type: 'skill_development',
            priority: 'High',
            title: 'Complete Advanced ML Certification',
            description: 'Your research background makes you ideal for ML specialization',
            estimated_roi: '+$30k salary potential',
            time_investment: '200 hours over 4 months',
            nft_bonus: 'Research Rockstar provides 50% discount on premium courses'
          },
          {
            type: 'networking',
            priority: 'Medium',
            title: 'Attend Top AI Conferences',
            description: 'Build connections in your target industry',
            conferences: ['NeurIPS', 'ICML', 'ICLR', 'AAAI'],
            nft_bonus: 'Leadership Legend unlocks VIP networking events',
            estimated_cost: '$5000 with NFT discounts applied'
          }
        ],
        achievement_career_mapping: {
          'Research Publication': {
            career_boost: '+25% for research roles',
            unlocks: ['PhD programs', 'Research positions', 'Academic careers'],
            salary_impact: '+$15k for research-focused roles'
          },
          'Leadership Award': {
            career_boost: '+20% for management roles',
            unlocks: ['Leadership programs', 'Management tracks', 'Entrepreneurship'],
            salary_impact: '+$20k for leadership positions'
          },
          'Innovation Challenge': {
            career_boost: '+30% for startup roles',
            unlocks: ['Startup opportunities', 'Product roles', 'Innovation labs'],
            salary_impact: '+$25k for innovation-focused positions'
          }
        }
      });
    }

    // For new Supabase users, return basic career data
    return res.json({
      career_insights: {
        recommended_paths: [
          {
            id: 'path-basic-1',
            title: 'Software Developer',
            match_percentage: 65,
            salary_range: '$70,000 - $120,000',
            growth_potential: 'High',
            demand_level: 'High',
            description: 'Build applications and websites using modern programming languages and frameworks',
            key_skills: ['JavaScript', 'Python', 'HTML/CSS', 'Problem Solving'],
            companies: ['Meta', 'Google', 'Microsoft', 'Amazon'],
            next_steps: ['Complete programming courses', 'Build portfolio projects', 'Practice coding challenges'],
            timeline: '6-12 months to entry level'
          },
          {
            id: 'path-basic-2',
            title: 'Data Analyst',
            match_percentage: 58,
            salary_range: '$60,000 - $95,000',
            growth_potential: 'High',
            demand_level: 'Very High',
            description: 'Analyze data to help organizations make informed business decisions',
            key_skills: ['SQL', 'Excel', 'Python', 'Data Visualization'],
            companies: ['Netflix', 'Spotify', 'Uber', 'Airbnb'],
            next_steps: ['Learn SQL and Python', 'Complete data analysis projects', 'Get familiar with Tableau'],
            timeline: '4-8 months to entry level'
          },
          {
            id: 'path-basic-3',
            title: 'Product Manager',
            match_percentage: 52,
            salary_range: '$80,000 - $130,000',
            growth_potential: 'Very High',
            demand_level: 'High',
            description: 'Guide product development and strategy to meet user needs and business goals',
            key_skills: ['Product Strategy', 'User Research', 'Project Management', 'Communication'],
            companies: ['Apple', 'Tesla', 'Slack', 'Zoom'],
            next_steps: ['Study product management fundamentals', 'Work on side projects', 'Build analytical skills'],
            timeline: '1-2 years with experience'
          }
        ],
        skill_gaps: [
          {
            skill: 'Programming Fundamentals',
            current_level: 30,
            target_level: 80,
            importance: 'Critical',
            resources: ['freeCodeCamp', 'Codecademy', 'YouTube tutorials'],
            estimated_time: '6 months'
          },
          {
            skill: 'Problem Solving',
            current_level: 50,
            target_level: 85,
            importance: 'High',
            resources: ['LeetCode', 'HackerRank', 'Project-based learning'],
            estimated_time: '4 months'
          }
        ]
      },
      industry_trends: [
        {
          id: 'trend-basic-1',
          category: 'Technology',
          trend_name: 'Remote Work Revolution',
          impact_level: 'High',
          growth_rate: '+35% remote positions',
          description: 'Companies embracing permanent remote and hybrid work models',
          opportunities: ['Remote Developer', 'Digital Nomad', 'Virtual Team Lead'],
          skills_in_demand: ['Communication', 'Self-Management', 'Digital Collaboration'],
          salary_impact: 'Access to global job market',
          timeline: 'Already mainstream'
        }
      ],
      networking_opportunities: [
        {
          id: 'network-basic-1',
          title: 'New Student Network',
          description: 'Connect with fellow students just starting their career journey',
          members: 1250,
          unlocked_by: ['Student status'],
          access_level: 'Open',
          benefits: ['Peer support', 'Study groups', 'Career advice'],
          next_event: 'Virtual Career Fair - August 25, 2025'
        }
      ],
      market_analysis: {
        tech_sector: {
          job_growth: '+22% next 5 years',
          avg_salary: '$125,000',
          top_skills: ['JavaScript', 'Python', 'Communication', 'Problem Solving'],
          hot_locations: ['Remote', 'Austin', 'Denver', 'Seattle']
        },
        entry_level: {
          job_growth: '+18% next 3 years',
          avg_salary: '$65,000',
          top_skills: ['Adaptability', 'Learning', 'Teamwork', 'Basic Tech'],
          hot_locations: ['Major cities', 'Tech hubs', 'Remote opportunities']
        }
      },
      personalized_recommendations: [
        {
          type: 'skill_development',
          priority: 'High',
          title: 'Start with Programming Basics',
          description: 'Build foundational programming skills to unlock career opportunities',
          estimated_roi: 'Entry into $70k+ salary range',
          time_investment: '300 hours over 6 months',
          nft_bonus: 'Unlock achievement NFTs for completed courses'
        },
        {
          type: 'networking',
          priority: 'Medium',
          title: 'Join Student Tech Communities',
          description: 'Connect with peers and learn from their experiences',
          communities: ['Student Developer Groups', 'University CS Clubs', 'Online Communities'],
          estimated_cost: 'Free to join most communities'
        }
      ],
      achievement_career_mapping: {
        'First Achievement': {
          career_boost: '+5% for all roles',
          unlocks: ['Basic networking opportunities'],
          salary_impact: 'Demonstrates initiative to employers'
        },
        'Academic Excellence': {
          career_boost: '+10% for technical roles',
          unlocks: ['Internship opportunities', 'Honor societies'],
          salary_impact: '+$5k for academic-focused positions'
        }
      }
    });

  } catch (error) {
    console.error('Careers API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}