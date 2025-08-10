import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateInput, schemas, uploadRateLimit } from '../middleware/security';
import { uploadSingle } from '../services/cloudinary';
import { sendEmail, emailTemplates } from '../services/email';
import prisma from '../config/database';
import config from '../config/environment';

const router = express.Router();

// Get user's achievements
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        nftTokens: {
          select: {
            id: true,
            tokenId: true,
            minted: true,
            level: true,
            rarity: true,
          },
        },
      },
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Submit new achievement
router.post('/', 
  authenticateToken,
  uploadRateLimit,
  uploadSingle('proof'),
  validateInput(schemas.achievement),
  async (req: any, res) => {
    try {
      const { type, title, description, gpaValue } = req.body;
      const proofUrl = req.file ? req.file.path : null;

      // Check if user already has this type of achievement pending/approved
      const existingAchievement = await prisma.achievement.findFirst({
        where: {
          userId: req.user.id,
          type,
          verificationStatus: { in: ['pending', 'approved'] },
        },
      });

      if (existingAchievement) {
        return res.status(409).json({ 
          error: `You already have a ${type} achievement that is ${existingAchievement.verificationStatus}` 
        });
      }

      const achievement = await prisma.achievement.create({
        data: {
          userId: req.user.id,
          type,
          title,
          description,
          gpaValue: type === 'gpa' ? parseFloat(gpaValue) : null,
          proofUrl,
          verificationStatus: 'pending',
        },
      });

      // TODO: Implement AI verification service
      // if (proofUrl && config.OPENAI_API_KEY) {
      //   await aiVerificationService.analyzeDocument(achievement.id, proofUrl);
      // }

      res.status(201).json({
        message: 'Achievement submitted successfully',
        achievement,
      });
    } catch (error) {
      console.error('Submit achievement error:', error);
      res.status(500).json({ error: 'Failed to submit achievement' });
    }
  }
);

// Get achievement by ID
router.get('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const achievement = await prisma.achievement.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        nftTokens: true,
      },
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    console.error('Get achievement error:', error);
    res.status(500).json({ error: 'Failed to fetch achievement' });
  }
});

// Update achievement
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const achievement = await prisma.achievement.findFirst({
      where: {
        id,
        userId: req.user.id,
        verificationStatus: 'pending', // Only allow updates to pending achievements
      },
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found or cannot be updated' });
    }

    const updatedAchievement = await prisma.achievement.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    res.json({
      message: 'Achievement updated successfully',
      achievement: updatedAchievement,
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

// Delete achievement
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;

    const achievement = await prisma.achievement.findFirst({
      where: {
        id,
        userId: req.user.id,
        verificationStatus: 'pending', // Only allow deletion of pending achievements
      },
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found or cannot be deleted' });
    }

    await prisma.achievement.delete({
      where: { id },
    });

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Delete achievement error:', error);
    res.status(500).json({ error: 'Failed to delete achievement' });
  }
});

export default router;