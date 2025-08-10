-- Academic NFT Marketplace - Supabase Setup
-- Run this in your Supabase SQL editor after creating your project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (converted from Prisma schema)

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    university_email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    student_id VARCHAR(255),
    wallet_address VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    gpa_value DECIMAL(3,2),
    proof_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(255),
    verified_at TIMESTAMP,
    verification_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NFT Tokens table
CREATE TABLE nft_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    token_id VARCHAR(255) NOT NULL,
    contract_address VARCHAR(255) NOT NULL,
    blockchain VARCHAR(50) NOT NULL,
    nft_type VARCHAR(50) NOT NULL,
    metadata_uri TEXT NOT NULL,
    minted BOOLEAN DEFAULT FALSE,
    minted_at TIMESTAMP,
    level INTEGER DEFAULT 1,
    rarity VARCHAR(50) DEFAULT 'common',
    stacked_achievements TEXT,
    evolution_points INTEGER DEFAULT 0,
    is_composite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(255) NOT NULL,
    size VARCHAR(50) NOT NULL,
    website VARCHAR(255),
    logo_url TEXT,
    description TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    contact_email VARCHAR(255) NOT NULL,
    tier VARCHAR(50) DEFAULT 'standard',
    credits_balance INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    required_nfts TEXT NOT NULL,
    min_level INTEGER DEFAULT 1,
    min_rarity VARCHAR(50) DEFAULT 'common',
    company_id UUID REFERENCES companies(id),
    posted_by VARCHAR(255) NOT NULL,
    salary VARCHAR(255),
    location VARCHAR(255),
    remote BOOLEAN DEFAULT FALSE,
    url TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    application_deadline TIMESTAMP,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    urgent BOOLEAN DEFAULT FALSE,
    cost INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Universities table
CREATE TABLE universities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    email_domain VARCHAR(255) UNIQUE NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo universities
INSERT INTO universities (name, email_domain, admin_email) VALUES
('Eastern Michigan University', 'emich.edu', 'admin@emich.edu'),
('Eastern University', 'eastern.edu', 'admin@eastern.edu'),
('Thomas Edison State University', 'tesu.edu', 'admin@tesu.edu'),
('Oakland University', 'oakland.edu', 'admin@oakland.edu'),
('Virginia Tech', 'vt.edu', 'admin@vt.edu');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_university_email ON users(university_email);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_nft_tokens_user_id ON nft_tokens(user_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_type ON opportunities(type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (basic security)
CREATE POLICY "Users can view their own data" ON users
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view their own achievements" ON achievements
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view their own NFTs" ON nft_tokens
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can view active opportunities" ON opportunities
    FOR SELECT USING (status = 'active');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_tokens_updated_at BEFORE UPDATE ON nft_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert demo data
INSERT INTO users (id, email, university_email, first_name, last_name, university, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'demo@student.edu', 'john.doe@emich.edu', 'John', 'Doe', 'Eastern Michigan University', true),
('550e8400-e29b-41d4-a716-446655440002', 'demo2@student.edu', 'jane.smith@vt.edu', 'Jane', 'Smith', 'Virginia Tech', true),
('550e8400-e29b-41d4-a716-446655440003', 'demo3@student.edu', 'alex.johnson@oakland.edu', 'Alex', 'Johnson', 'Oakland University', true);

-- Insert demo achievements
INSERT INTO achievements (user_id, type, title, description, gpa_value, verified, verification_status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'gpa', 'Dean''s List Achievement', 'Maintained 3.8 GPA for Fall 2023', 3.8, true, 'approved'),
('550e8400-e29b-41d4-a716-446655440001', 'research', 'Published Research Paper', 'Co-authored paper on blockchain applications in education', null, true, 'approved'),
('550e8400-e29b-41d4-a716-446655440001', 'leadership', 'Student Government President', 'Elected as Student Government President for 2023-2024', null, true, 'approved');

COMMIT;