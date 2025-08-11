import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  university: string;
  university_email?: string;
  student_id?: string;
  role: 'student' | 'admin';
  email_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'academic' | 'research' | 'leadership' | 'extracurricular';
  category: string;
  date_achieved: string;
  status: 'pending' | 'verified' | 'rejected';
  proof_url?: string;
  nft_minted: boolean;
  nft_token_id?: string;
  verified_by?: string;
  verification_date?: string;
  skill_tags: string[];
  confidence_score: number;
  created_at: string;
  updated_at: string;
}

export interface NFT {
  id: string;
  user_id: string;
  achievement_id?: string;
  token_id: string;
  name: string;
  description: string;
  type: 'gpa_guardian' | 'research_rockstar' | 'leadership_legend';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  level: number;
  experience: number;
  attributes: Record<string, any>;
  image_url: string;
  animation_url?: string;
  staking_rewards: number;
  market_value: number;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const supabaseAuth = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    university: string;
    universityEmail?: string;
    studentId?: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          university: userData.university,
          university_email: userData.universityEmail,
          student_id: userData.studentId,
          role: 'student'
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Verify OTP
  async verifyOtp(email: string, token: string, type: 'signup' | 'email_change' = 'signup') {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    });

    if (error) throw error;
    return data;
  },

  // Resend OTP
  async resendOtp(email: string, type: 'signup' | 'email_change' = 'signup') {
    const { data, error } = await supabase.auth.resend({
      type,
      email
    });

    if (error) throw error;
    return data;
  },

  // Get current session
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
};

// Database helper functions
export const supabaseDB = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update user profile
  async upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user achievements
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user NFTs
  async getUserNFTs(userId: string): Promise<NFT[]> {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create achievement
  async createAchievement(achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .insert(achievement)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update achievement status
  async updateAchievementStatus(achievementId: string, status: Achievement['status'], verificationData?: {
    verified_by?: string;
    verification_date?: string;
  }): Promise<Achievement> {
    const updateData = {
      status,
      ...verificationData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('achievements')
      .update(updateData)
      .eq('id', achievementId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create NFT
  async createNFT(nft: Omit<NFT, 'id' | 'created_at' | 'updated_at'>): Promise<NFT> {
    const { data, error } = await supabase
      .from('nfts')
      .insert(nft)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default supabase;