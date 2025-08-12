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
    
    // Return comprehensive university comparison data
    return res.json({
      your_university: {
        name: 'Eastern Michigan University',
        code: 'EMU',
        type: 'Public Research University',
        location: 'Ypsilanti, Michigan',
        founded: 1849,
        enrollment: 17500,
        your_stats: {
          current_rank: 15,
          total_students: 847,
          achievements_earned: 12,
          nfts_minted: 5,
          gpa_percentile: 92,
          extracurricular_score: 88
        },
        university_wide_stats: {
          avg_gpa: 3.2,
          research_publications: 1250,
          innovation_score: 78,
          career_placement_rate: 89,
          avg_starting_salary: 58000
        },
        strengths: ['Education', 'Business', 'Engineering', 'Arts'],
        notable_alumni: ['Dr. John Smith - NASA Engineer', 'Sarah Johnson - Fortune 500 CEO'],
        campus_highlights: ['Modern research facilities', 'Strong industry partnerships', 'Diverse student body']
      },
      comparison_universities: [
        {
          name: 'University of Michigan',
          code: 'UMICH',
          type: 'Public Research University',
          location: 'Ann Arbor, Michigan',
          ranking: {
            national: 3,
            regional: 1,
            program_specific: {
              'Computer Science': 5,
              'Engineering': 4,
              'Business': 8
            }
          },
          stats: {
            enrollment: 47000,
            acceptance_rate: 23,
            avg_gpa: 3.8,
            avg_sat: 1450,
            avg_starting_salary: 72000,
            research_funding: '$1.5B',
            faculty_student_ratio: '15:1'
          },
          nft_marketplace_stats: {
            active_students: 2300,
            avg_achievements: 8.5,
            top_nft_holders: 150,
            marketplace_volume: '$125,000'
          },
          comparison_with_yours: {
            prestige: '+25%',
            research_opportunities: '+40%',
            career_prospects: '+20%',
            cost: '+35%',
            competition: '+60%'
          },
          transfer_difficulty: 'Very Hard',
          your_admission_chances: '15%',
          recommended_improvements: [
            'Increase research publications',
            'Boost GPA to 3.8+',
            'Gain leadership experience'
          ]
        },
        {
          name: 'Michigan State University',
          code: 'MSU',
          type: 'Public Research University',
          location: 'East Lansing, Michigan',
          ranking: {
            national: 85,
            regional: 3,
            program_specific: {
              'Computer Science': 45,
              'Engineering': 52,
              'Business': 42
            }
          },
          stats: {
            enrollment: 50000,
            acceptance_rate: 71,
            avg_gpa: 3.6,
            avg_sat: 1240,
            avg_starting_salary: 62000,
            research_funding: '$700M',
            faculty_student_ratio: '17:1'
          },
          nft_marketplace_stats: {
            active_students: 1800,
            avg_achievements: 6.2,
            top_nft_holders: 85,
            marketplace_volume: '$75,000'
          },
          comparison_with_yours: {
            prestige: '+15%',
            research_opportunities: '+25%',
            career_prospects: '+10%',
            cost: '+15%',
            competition: '+20%'
          },
          transfer_difficulty: 'Moderate',
          your_admission_chances: '75%',
          recommended_improvements: [
            'Maintain current GPA',
            'Add more extracurriculars'
          ]
        },
        {
          name: 'Stanford University',
          code: 'STANFORD',
          type: 'Private Research University',
          location: 'Stanford, California',
          ranking: {
            national: 2,
            regional: 1,
            program_specific: {
              'Computer Science': 1,
              'Engineering': 2,
              'Business': 3
            }
          },
          stats: {
            enrollment: 17000,
            acceptance_rate: 4,
            avg_gpa: 3.96,
            avg_sat: 1520,
            avg_starting_salary: 95000,
            research_funding: '$1.8B',
            faculty_student_ratio: '7:1'
          },
          nft_marketplace_stats: {
            active_students: 1200,
            avg_achievements: 15.8,
            top_nft_holders: 95,
            marketplace_volume: '$250,000'
          },
          comparison_with_yours: {
            prestige: '+80%',
            research_opportunities: '+100%',
            career_prospects: '+65%',
            cost: '+150%',
            competition: '+200%'
          },
          transfer_difficulty: 'Nearly Impossible',
          your_admission_chances: '2%',
          recommended_improvements: [
            'Exceptional research achievements',
            'Perfect GPA',
            'Groundbreaking innovations',
            'National recognition'
          ]
        },
        {
          name: 'Arizona State University',
          code: 'ASU',
          type: 'Public Research University',
          location: 'Tempe, Arizona',
          ranking: {
            national: 117,
            regional: 8,
            program_specific: {
              'Computer Science': 65,
              'Engineering': 45,
              'Business': 38
            }
          },
          stats: {
            enrollment: 80000,
            acceptance_rate: 88,
            avg_gpa: 3.4,
            avg_sat: 1210,
            avg_starting_salary: 55000,
            research_funding: '$600M',
            faculty_student_ratio: '23:1'
          },
          nft_marketplace_stats: {
            active_students: 3200,
            avg_achievements: 4.8,
            top_nft_holders: 140,
            marketplace_volume: '$95,000'
          },
          comparison_with_yours: {
            prestige: '-5%',
            research_opportunities: '+10%',
            career_prospects: '-5%',
            cost: '+5%',
            competition: '-10%'
          },
          transfer_difficulty: 'Easy',
          your_admission_chances: '95%',
          recommended_improvements: ['Current profile is strong for admission']
        }
      ],
      achievement_comparisons: {
        your_achievements_vs_peers: {
          'Dean\'s List': {
            your_university: '12% of students',
            umich: '8% of students',
            msu: '15% of students',
            stanford: '5% of students',
            asu: '18% of students'
          },
          'Research Publications': {
            your_university: '3% of undergrads',
            umich: '12% of undergrads',
            msu: '8% of undergrads',
            stanford: '25% of undergrads',
            asu: '5% of undergrads'
          },
          'Leadership Positions': {
            your_university: '8% of students',
            umich: '6% of students',
            msu: '10% of students',
            stanford: '15% of students',
            asu: '12% of students'
          }
        },
        nft_rarity_comparison: {
          'Legendary NFTs': {
            your_count: 1,
            umich_avg: 0.3,
            msu_avg: 0.1,
            stanford_avg: 2.1,
            asu_avg: 0.2
          },
          'Epic NFTs': {
            your_count: 2,
            umich_avg: 1.2,
            msu_avg: 0.8,
            stanford_avg: 3.5,
            asu_avg: 0.6
          }
        }
      },
      transfer_recommendations: [
        {
          university: 'University of Michigan',
          recommendation_strength: 'Strong consideration',
          best_timing: 'After sophomore year',
          required_steps: [
            'Increase GPA to 3.8+',
            'Complete 2+ research projects',
            'Gain leadership experience',
            'Strong recommendation letters'
          ],
          estimated_timeline: '18 months preparation',
          success_probability: '25%',
          nft_advantages: 'Research Rockstar NFT shows research capability'
        },
        {
          university: 'Michigan State University',
          recommendation_strength: 'Excellent match',
          best_timing: 'Next semester',
          required_steps: [
            'Maintain current GPA',
            'Complete application',
            'Submit transcripts'
          ],
          estimated_timeline: '3 months',
          success_probability: '85%',
          nft_advantages: 'All current NFTs provide application boost'
        }
      ],
      market_insights: {
        university_trends: [
          'Increasing focus on research opportunities',
          'Growing importance of practical experience',
          'Rising competition for top programs',
          'NFT achievements becoming admission factors'
        ],
        career_outcome_comparison: {
          'Tech Industry Placement': {
            emu: '25%',
            umich: '45%',
            msu: '35%',
            stanford: '75%',
            asu: '30%'
          },
          'Graduate School Acceptance': {
            emu: '60%',
            umich: '85%',
            msu: '70%',
            stanford: '95%',
            asu: '55%'
          },
          'Starting Salary Premium': {
            emu: '$58k',
            umich: '$72k',
            msu: '$62k',
            stanford: '$95k',
            asu: '$55k'
          }
        }
      },
      personalized_insights: [
        {
          type: 'strength',
          title: 'Outstanding Academic Performance',
          description: 'Your Dean\'s List achievement puts you in top 10% nationally',
          impact: 'Strong advantage for competitive programs'
        },
        {
          type: 'opportunity',
          title: 'Research Leadership Gap',
          description: 'Limited research leadership compared to top universities',
          recommendation: 'Seek research team leadership roles'
        },
        {
          type: 'nft_advantage',
          title: 'Legendary NFT Holder Status',
          description: 'Your Innovation Titan NFT is extremely rare',
          impact: 'Significant differentiation in applications'
        }
      ]
    });

  } catch (error) {
    console.error('Universities API error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}