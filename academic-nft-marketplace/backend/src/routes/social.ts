import express from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get social posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await prisma.socialPost.findMany({
      where: { isPublic: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            university: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get leaderboard
router.get('/leaderboard/:type', async (req, res) => {
  try {
    const { type } = req.params;

    const users = await prisma.user.findMany({
      include: {
        achievements: {
          where: { verified: true },
        },
        nftTokens: true,
        socialProfile: true,
      },
      take: 10,
    });

    // Sort by achievement count for demo
    const leaderboard = users
      .map(user => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        university: user.university,
        achievements: user.achievements.length,
        nfts: user.nftTokens.length,
        points: user.socialProfile?.totalPoints || 0,
      }))
      .sort((a, b) => b.achievements - a.achievements);

    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;