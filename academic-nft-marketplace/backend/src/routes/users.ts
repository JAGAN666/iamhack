import express from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        universityEmail: true,
        firstName: true,
        lastName: true,
        university: true,
        studentId: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: any, res) => {
  try {
    const { firstName, lastName, studentId } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        studentId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        studentId: true,
        role: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user stats
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const [achievementCount, nftCount, opportunityCount] = await Promise.all([
      prisma.achievement.count({ where: { userId: req.user.id } }),
      prisma.nFTToken.count({ where: { userId: req.user.id } }),
      prisma.accessGrant.count({ where: { userId: req.user.id } }),
    ]);

    res.json({
      achievements: achievementCount,
      nfts: nftCount,
      opportunities: opportunityCount,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;