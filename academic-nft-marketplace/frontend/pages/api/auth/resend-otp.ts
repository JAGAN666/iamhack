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
    const { email, type = 'signup' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Resend OTP with Supabase
    const { error } = await supabase.auth.resend({
      type: type as any,
      email
    });

    if (error) {
      console.error('OTP resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('OTP resend error:', error);
    return res.status(500).json({ error: 'Failed to resend verification email' });
  }
}