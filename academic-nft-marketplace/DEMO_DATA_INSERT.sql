-- ========================================
-- DEMO DATA INSERT - COMPREHENSIVE SAMPLE DATA
-- ========================================
-- Run this after the database setup and demo user creation

-- First, verify demo user exists
SELECT 'Checking demo user...' as status;
SELECT id, email, first_name, last_name FROM user_profiles WHERE email = 'demo@student.edu';

-- Insert demo achievements
INSERT INTO achievements (
  id,
  user_id,
  title,
  description,
  type,
  category,
  date_achieved,
  status,
  proof_url,
  nft_minted,
  nft_token_id,
  verified_by,
  verification_date,
  skill_tags,
  confidence_score
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Dean''s List Achievement',
  'Achieved Dean''s List status for Fall 2024 semester with a 3.9 GPA',
  'academic',
  'Academic Excellence',
  '2024-12-15',
  'verified',
  '/api/placeholder/achievement-proof.pdf',
  true,
  'NFT-001',
  'Dr. Smith, Academic Advisor',
  '2024-12-20 10:00:00+00',
  ARRAY['Academic Excellence', 'Mathematics', 'Research'],
  0.95
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Research Publication',
  'Co-authored research paper on Machine Learning applications published in IEEE Journal',
  'research',
  'Research & Innovation',
  '2024-11-30',
  'verified',
  '/api/placeholder/research-paper.pdf',
  true,
  'NFT-002',
  'Prof. Johnson, Research Supervisor',
  '2024-12-05 14:30:00+00',
  ARRAY['Research', 'Machine Learning', 'Academic Writing'],
  0.98
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Student Leadership Award',
  'Recognized for outstanding leadership as President of Computer Science Club',
  'leadership',
  'Leadership & Service',
  '2024-10-15',
  'verified',
  '/api/placeholder/leadership-certificate.pdf',
  true,
  'NFT-003',
  'Student Affairs Office',
  '2024-10-20 09:15:00+00',
  ARRAY['Leadership', 'Communication', 'Project Management'],
  0.92
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Hackathon Winner',
  'First place winner at EMU TechHacks 2024 with innovative sustainability app',
  'extracurricular',
  'Innovation & Technology',
  '2024-09-28',
  'verified',
  '/api/placeholder/hackathon-trophy.jpg',
  true,
  'NFT-004',
  'TechHacks Organizing Committee',
  '2024-10-01 16:00:00+00',
  ARRAY['Programming', 'Innovation', 'Teamwork'],
  0.97
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Academic Scholarship Recipient',
  'Awarded merit-based scholarship for academic excellence and community service',
  'academic',
  'Scholarships & Awards',
  '2024-08-20',
  'verified',
  '/api/placeholder/scholarship-letter.pdf',
  true,
  'NFT-005',
  'Financial Aid Office',
  '2024-08-25 11:30:00+00',
  ARRAY['Academic Excellence', 'Community Service'],
  0.94
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Volunteer Excellence Award',
  'Completed 200+ hours of community service tutoring underprivileged students',
  'extracurricular',
  'Community Service',
  '2024-07-15',
  'verified',
  '/api/placeholder/volunteer-certificate.pdf',
  false,
  NULL,
  'Community Service Center',
  '2024-07-20 13:45:00+00',
  ARRAY['Community Service', 'Teaching', 'Mentoring'],
  0.89
),
(
  '550e8400-e29b-41d4-a716-446655440007',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Innovation Challenge Runner-up',
  'Second place in university-wide innovation challenge for sustainable technology',
  'research',
  'Innovation & Technology',
  '2024-06-30',
  'pending',
  '/api/placeholder/innovation-project.pdf',
  false,
  NULL,
  NULL,
  NULL,
  ARRAY['Innovation', 'Sustainability', 'Technology'],
  0.91
),
(
  '550e8400-e29b-41d4-a716-446655440008',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  'Language Proficiency Certificate',
  'Achieved advanced proficiency in Spanish language with official certification',
  'academic',
  'Language & International',
  '2024-05-15',
  'verified',
  '/api/placeholder/language-cert.pdf',
  false,
  NULL,
  'Language Testing Center',
  '2024-05-20 10:00:00+00',
  ARRAY['Language', 'Communication', 'Cultural Competency'],
  0.96
) ON CONFLICT (id) DO NOTHING;

-- Insert NFTs for minted achievements
INSERT INTO nfts (
  id,
  user_id,
  achievement_id,
  token_id,
  name,
  description,
  type,
  rarity,
  level,
  experience,
  attributes,
  image_url,
  animation_url,
  staking_rewards,
  market_value
) VALUES 
(
  '650e8400-e29b-41d4-a716-446655440001',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  '550e8400-e29b-41d4-a716-446655440001',
  'NFT-001',
  'GPA Guardian - Elite Scholar',
  'A shimmering academic achievement NFT representing Dean''s List excellence',
  'gpa_guardian',
  'Rare',
  3,
  750,
  '{"intelligence": 95, "dedication": 92, "academic_excellence": 98, "mathematical_skills": 94}',
  '/api/placeholder/nft-gpa-guardian.png',
  '/api/placeholder/nft-gpa-animation.mp4',
  15.50,
  0.075
),
(
  '650e8400-e29b-41d4-a716-446655440002',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  '550e8400-e29b-41d4-a716-446655440002',
  'NFT-002',
  'Research Rockstar - Innovation Master',
  'An epic research achievement NFT pulsing with intellectual energy',
  'research_rockstar',
  'Epic',
  4,
  1200,
  '{"innovation": 98, "research_skills": 96, "analytical_thinking": 94, "publication_impact": 97}',
  '/api/placeholder/nft-research-rockstar.png',
  '/api/placeholder/nft-research-animation.mp4',
  28.75,
  0.125
),
(
  '650e8400-e29b-41d4-a716-446655440003',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  '550e8400-e29b-41d4-a716-446655440003',
  'NFT-003',
  'Leadership Legend - Community Champion',
  'A legendary leadership NFT radiating charismatic energy',
  'leadership_legend',
  'Epic',
  4,
  1100,
  '{"leadership": 96, "communication": 93, "team_building": 91, "inspiration": 95}',
  '/api/placeholder/nft-leadership-legend.png',
  '/api/placeholder/nft-leadership-animation.mp4',
  25.30,
  0.110
),
(
  '650e8400-e29b-41d4-a716-446655440004',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  '550e8400-e29b-41d4-a716-446655440004',
  'NFT-004',
  'Innovation Titan - Legendary Creator',
  'The rarest hackathon champion NFT with mythical properties',
  'research_rockstar',
  'Legendary',
  5,
  2000,
  '{"creativity": 99, "technical_skills": 97, "problem_solving": 98, "innovation": 99}',
  '/api/placeholder/nft-innovation-titan.png',
  '/api/placeholder/nft-innovation-animation.mp4',
  50.00,
  0.250
),
(
  '650e8400-e29b-41d4-a716-446655440005',
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
  '550e8400-e29b-41d4-a716-446655440005',
  'NFT-005',
  'GPA Guardian - Scholarship Sage',
  'A prestigious scholarship NFT glowing with academic excellence',
  'gpa_guardian',
  'Rare',
  3,
  800,
  '{"academic_merit": 96, "community_service": 88, "leadership_potential": 85, "financial_wisdom": 82}',
  '/api/placeholder/nft-scholarship-sage.png',
  '/api/placeholder/nft-scholarship-animation.mp4',
  18.25,
  0.085
) ON CONFLICT (token_id) DO NOTHING;

-- Verify insertions
SELECT 'Demo data insertion completed!' as status;

SELECT 'Achievements inserted:' as status;
SELECT COUNT(*) as achievement_count FROM achievements WHERE user_id = '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9';

SELECT 'NFTs inserted:' as status;
SELECT COUNT(*) as nft_count FROM nfts WHERE user_id = '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9';

SELECT 'Events available:' as status;
SELECT COUNT(*) as event_count FROM events;

-- Show summary
SELECT 
  'Demo User Summary:' as summary_type,
  up.first_name || ' ' || up.last_name as name,
  up.email,
  up.university,
  COUNT(DISTINCT a.id) as achievements,
  COUNT(DISTINCT n.id) as nfts,
  COUNT(DISTINCT CASE WHEN a.status = 'verified' THEN a.id END) as verified_achievements,
  COUNT(DISTINCT CASE WHEN n.rarity = 'Legendary' THEN n.id END) as legendary_nfts
FROM user_profiles up
LEFT JOIN achievements a ON up.id = a.user_id
LEFT JOIN nfts n ON up.id = n.user_id
WHERE up.email = 'demo@student.edu'
GROUP BY up.id, up.first_name, up.last_name, up.email, up.university;

SELECT 'Setup complete! Demo user ready with rich data for testing.' as final_message;