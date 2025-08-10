import express from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req: any, res) => {
  try {
    const [totalUsers, totalAchievements, totalNFTs, totalOpportunities] = await Promise.all([
      prisma.user.count(),
      prisma.achievement.count({ where: { verified: true } }),
      prisma.nFTToken.count(),
      prisma.opportunity.count({ where: { status: 'active' } }),
    ]);

    res.json({
      totalUsers,
      totalAchievements,
      totalNFTs,
      totalOpportunities,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;