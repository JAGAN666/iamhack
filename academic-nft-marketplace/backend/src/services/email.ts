import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Fallback to nodemailer for development
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid in production
      await sgMail.send({
        to: options.to,
        from: process.env.FROM_EMAIL || 'noreply@academicnft.com',
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } else {
      // Use nodemailer for development
      await transporter.sendMail({
        from: process.env.FROM_EMAIL || 'noreply@academicnft.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    }
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Email templates
export const emailTemplates = {
  verification: (name: string, verificationUrl: string) => ({
    subject: '🎓 Verify Your Academic NFT Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎓 Academic NFT Marketplace</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Welcome, ${name}! 🎉</h2>
          <p>Thank you for joining the Academic NFT Marketplace. Please verify your email address to get started:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>Academic NFT Marketplace - Transforming Education, One Achievement at a Time</p>
        </div>
      </div>
    `,
  }),

  achievementApproved: (name: string, achievementTitle: string, nftType: string) => ({
    subject: '🏆 Your Achievement Has Been Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🏆 Achievement Approved!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Congratulations, ${name}! 🎉</h2>
          <p>Your achievement "<strong>${achievementTitle}</strong>" has been verified and approved!</p>
          <p>You can now mint your <strong>${nftType}</strong> NFT and unlock exclusive opportunities.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #11998e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Mint Your NFT
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  opportunityUnlocked: (name: string, opportunityTitle: string, companyName: string) => ({
    subject: '🚀 New Opportunity Unlocked!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚀 Opportunity Unlocked!</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Great news, ${name}! 🎯</h2>
          <p>Your NFT achievements have unlocked a new opportunity:</p>
          <h3>"${opportunityTitle}"</h3>
          <p>Posted by: <strong>${companyName}</strong></p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/opportunities" style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Opportunity
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  weeklyDigest: (name: string, stats: any) => ({
    subject: '📊 Your Weekly Academic NFT Summary',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📊 Weekly Summary</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hi ${name}! 👋</h2>
          <p>Here's your weekly Academic NFT summary:</p>
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>Your Stats This Week:</h3>
            <ul>
              <li>🏆 Achievements: ${stats.achievements || 0}</li>
              <li>🎨 NFTs Minted: ${stats.nfts || 0}</li>
              <li>🚀 Opportunities Unlocked: ${stats.opportunities || 0}</li>
              <li>📈 Leaderboard Rank: #${stats.rank || 'N/A'}</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  }),
};