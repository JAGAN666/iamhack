-- ========================================
-- SUPABASE DATABASE SETUP - RUN THIS NOW
-- ========================================
-- Copy and paste this entire script into Supabase SQL Editor

-- Step 1: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 2: Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  university TEXT NOT NULL,
  university_email TEXT,
  student_id TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('academic', 'research', 'leadership', 'extracurricular')),
  category TEXT NOT NULL,
  date_achieved DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  proof_url TEXT,
  nft_minted BOOLEAN DEFAULT FALSE,
  nft_token_id TEXT,
  verified_by TEXT,
  verification_date TIMESTAMPTZ,
  skill_tags TEXT[] DEFAULT '{}',
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create nfts table
CREATE TABLE IF NOT EXISTS nfts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,
  token_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gpa_guardian', 'research_rockstar', 'leadership_legend')),
  rarity TEXT NOT NULL CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  attributes JSONB DEFAULT '{}',
  image_url TEXT,
  animation_url TEXT,
  staking_rewards DECIMAL(10,2) DEFAULT 0,
  market_value DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  max_attendees INTEGER NOT NULL,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  nft_discounts JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  organizer TEXT NOT NULL,
  agenda TEXT[] DEFAULT '{}',
  speakers TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  ticket_number TEXT UNIQUE NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  nft_discount_applied TEXT,
  discount_amount INTEGER DEFAULT 0,
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_status ON achievements(status);
CREATE INDEX IF NOT EXISTS idx_nfts_user_id ON nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_nfts_type ON nfts(type);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);

-- Step 8: Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Achievements policies
CREATE POLICY "Users can view their own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- NFTs policies
CREATE POLICY "Users can view their own NFTs" ON nfts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NFTs" ON nfts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tickets policies
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events policies (public read access)
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Step 10: Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, university, university_email, student_id, role, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'university', 'Unknown University'),
    NEW.raw_user_meta_data->>'university_email',
    NEW.raw_user_meta_data->>'student_id',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 12: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS handle_updated_at ON achievements;
DROP TRIGGER IF EXISTS handle_updated_at ON nfts;
DROP TRIGGER IF EXISTS handle_updated_at ON events;
DROP TRIGGER IF EXISTS handle_updated_at ON tickets;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON nfts FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Step 14: Insert sample events data
INSERT INTO events (
  title, description, full_description, date, time, location, price, max_attendees, current_attendees,
  image_url, nft_discounts, tags, organizer, agenda, speakers, status
) VALUES 
(
  'Future of Academic Research Conference',
  'Join leading researchers and academics to explore cutting-edge developments in academic research methodologies and emerging technologies.',
  'This comprehensive conference brings together the brightest minds in academia to discuss the future of research. Over the course of a full day, participants will engage with cutting-edge research methodologies, emerging technologies, and innovative approaches to academic inquiry.',
  '2025-09-15',
  '9:00 AM - 5:00 PM',
  'Harvard University, Cambridge, MA',
  75.00,
  500,
  342,
  '/api/placeholder/600/400',
  '{"gpa_guardian": 20, "research_rockstar": 100, "leadership_legend": 30}',
  ARRAY['Research', 'Academic', 'Technology'],
  'Harvard Research Institute',
  ARRAY[
    '9:00 AM - Registration & Coffee',
    '9:30 AM - Opening Keynote: The Future of AI in Research',
    '10:30 AM - Panel: Cross-Disciplinary Collaboration',
    '12:00 PM - Networking Lunch',
    '1:30 PM - Workshop: Modern Research Methodologies',
    '3:00 PM - Poster Session',
    '4:00 PM - Closing Remarks & Next Steps'
  ],
  ARRAY[
    'Dr. Sarah Chen - MIT AI Research Lab',
    'Prof. Michael Johnson - Harvard Medical School',
    'Dr. Lisa Rodriguez - Stanford Engineering',
    'Prof. David Kim - University of California'
  ],
  'active'
),
(
  'Student Leadership Summit 2025',
  'Develop your leadership skills with workshops, networking sessions, and talks from successful student leaders across universities.',
  'The Student Leadership Summit 2025 is designed to empower the next generation of academic and professional leaders. This intensive full-day program features interactive workshops, panel discussions, and networking opportunities with established leaders from various fields.',
  '2025-08-22',
  '10:00 AM - 6:00 PM',
  'Stanford University, Palo Alto, CA',
  45.00,
  300,
  178,
  '/api/placeholder/600/400',
  '{"gpa_guardian": 15, "research_rockstar": 20, "leadership_legend": 100}',
  ARRAY['Leadership', 'Networking', 'Development'],
  'Stanford Student Leadership Council',
  ARRAY['10:00 AM - Registration & Welcome Coffee', '10:30 AM - Opening Keynote: Leadership in the Digital Age', '12:00 PM - Leadership Workshop: Building Effective Teams', '1:00 PM - Networking Lunch', '2:30 PM - Panel: Student Leaders Across Universities', '4:00 PM - Interactive Workshop: Communication Skills', '5:30 PM - Closing Ceremony & Awards'],
  ARRAY['Maria Rodriguez - Former Student Body President', 'Alex Thompson - Startup Founder & Alumni', 'Dr. Jennifer Walsh - Leadership Development Expert', 'Carlos Martinez - Non-profit Organization Leader'],
  'active'
),
(
  'Cross-University Networking Night',
  'Connect with students, alumni, and professionals from partner universities. Perfect for building your academic and professional network.',
  'Join us for an exclusive evening of networking and connection-building with peers from top universities across the country.',
  '2025-08-30',
  '6:00 PM - 9:00 PM',
  'MIT Campus, Boston, MA',
  25.00,
  200,
  89,
  '/api/placeholder/600/400',
  '{"gpa_guardian": 20, "research_rockstar": 30, "leadership_legend": 40}',
  ARRAY['Networking', 'Social', 'Career'],
  'Inter-University Alliance',
  ARRAY['6:00 PM - Welcome Reception & Check-in', '6:30 PM - Speed Networking Sessions', '7:30 PM - Industry Panel Discussion', '8:15 PM - Open Networking & Refreshments', '9:00 PM - Closing & Contact Exchange'],
  ARRAY['Sarah Kim - Tech Industry Recruiter', 'Michael Chen - Alumni Network Coordinator', 'Dr. Lisa Johnson - Career Development Advisor', 'James Wilson - Startup Ecosystem Leader'],
  'active'
) ON CONFLICT DO NOTHING;

-- Step 15: Verify everything was created
SELECT 'Database setup complete! Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'achievements', 'nfts', 'events', 'tickets')
ORDER BY table_name;

SELECT 'Sample events inserted:' as status;
SELECT COUNT(*) as event_count FROM events;

SELECT 'Database setup completed successfully!' as final_status;