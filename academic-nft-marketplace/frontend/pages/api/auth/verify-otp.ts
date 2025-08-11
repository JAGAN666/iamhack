import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, token, type = 'signup' } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and OTP token are required' });
    }

    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as any
    });

    if (error) {
      console.error('OTP verification error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    // Create user profile from auth data
    const userProfile = {
      id: data.user.id,
      email: data.user.email!,
      firstName: data.user.user_metadata?.first_name || 'User',
      lastName: data.user.user_metadata?.last_name || 'Name',
      university: data.user.user_metadata?.university || 'Unknown University',
      role: data.user.user_metadata?.role || 'student',
      emailVerified: true
    };

    return res.json({
      message: 'Email verified successfully',
      user: userProfile,
      token: data.session?.access_token
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
}