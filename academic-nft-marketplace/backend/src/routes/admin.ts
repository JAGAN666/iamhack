import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateInput, schemas } from '../middleware/security';
import prisma from '../config/database';

const router = express.Router();

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAchievements,
      totalNFTs,
      totalOpportunities,
      pendingAchievements,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.achievement.count(),
      prisma.nFTToken.count(),
      prisma.opportunity.count(),
      prisma.achievement.count({ where: { verified: false } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    res.json({
      totalUsers,
      totalAchievements,
      totalNFTs,
      totalOpportunities,
      pendingAchievements,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get pending achievements for verification
router.get('/achievements/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { verified: false },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            university: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(achievements);
  } catch (error) {
    console.error('Pending achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch pending achievements' });
  }
});

// Verify achievement
router.post('/achievements/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, reason } = req.body;

    const achievement = await prisma.achievement.update({
      where: { id },
      data: {
        verified: approved,
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
        verificationStatus: approved ? 'approved' : 'rejected',
      },
      include: {
        user: true,
      },
    });

    // TODO: Send notification email to user

    res.json({
      message: `Achievement ${approved ? 'approved' : 'rejected'} successfully`,
      achievement,
    });
  } catch (error) {
    console.error('Achievement verification error:', error);
    res.status(500).json({ error: 'Failed to verify achievement' });
  }
});

export default router;