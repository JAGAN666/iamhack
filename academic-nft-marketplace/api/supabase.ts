import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase configuration for API routes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key for server-side operations
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create regular client for user operations
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper functions for API operations
export const supabaseAPI = {
  // Verify user session from JWT token
  async verifyUser(jwt: string) {
    const { data, error } = await supabase.auth.getUser(jwt);
    if (error) throw error;
    return data.user;
  },

  // Get user profile with admin privileges
  async getUserProfileAdmin(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create user profile (admin operation)
  async createUserProfile(profile: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    university: string;
    university_email?: string;
    student_id?: string;
    role?: 'student' | 'admin';
    email_verified?: boolean;
  }) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        ...profile,
        role: profile.role || 'student',
        email_verified: profile.email_verified || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<{
    first_name: string;
    last_name: string;
    university: string;
    university_email: string;
    student_id: string;
    email_verified: boolean;
    avatar_url: string;
  }>) {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user achievements
  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user NFTs
  async getUserNFTs(userId: string) {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get user stats for dashboard
  async getUserStats(userId: string) {
    // Get achievements count
    const { data: achievements, error: achError } = await supabase
      .from('achievements')
      .select('id, status, nft_minted')
      .eq('user_id', userId);

    if (achError) throw achError;

    // Get NFTs count
    const { data: nfts, error: nftError } = await supabase
      .from('nfts')
      .select('id, rarity, level, staking_rewards')
      .eq('user_id', userId);

    if (nftError) throw nftError;

    // Calculate stats
    const totalAchievements = achievements?.length || 0;
    const verifiedAchievements = achievements?.filter(a => a.status === 'verified').length || 0;
    const mintedNFTs = achievements?.filter(a => a.nft_minted).length || 0;
    const totalStakingRewards = nfts?.reduce((sum, nft) => sum + (nft.staking_rewards || 0), 0) || 0;
    const rareAchievements = nfts?.filter(nft => nft.rarity === 'Rare' || nft.rarity === 'Epic').length || 0;
    const legendaryAchievements = nfts?.filter(nft => nft.rarity === 'Legendary').length || 0;

    return {
      totalAchievements,
      verifiedAchievements,
      mintedNFTs,
      unlockedOpportunities: verifiedAchievements * 2 + mintedNFTs * 3, // Formula for opportunities
      level: Math.floor((verifiedAchievements + mintedNFTs) / 2) + 1,
      xp: verifiedAchievements * 200 + mintedNFTs * 300,
      totalXP: 5000, // Target XP for next level
      streakDays: Math.min(totalAchievements * 2, 30), // Max 30 day streak
      rank: legendaryAchievements > 0 ? 'Legendary Scholar' : 
            rareAchievements > 2 ? 'Epic Scholar' : 
            verifiedAchievements > 5 ? 'Distinguished Student' : 'Rising Scholar',
      battlePassLevel: Math.floor((verifiedAchievements + mintedNFTs) / 3) + 1,
      skillPoints: verifiedAchievements * 10 + mintedNFTs * 15,
      rareAchievements,
      legendaryAchievements,
      stakingRewards: totalStakingRewards
    };
  }
};

export default supabaseAdmin;