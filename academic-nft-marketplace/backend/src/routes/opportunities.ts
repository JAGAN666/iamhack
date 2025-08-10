import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get all opportunities
router.get('/', optionalAuth, async (req: any, res) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: { status: 'active' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            logoUrl: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(opportunities);
  } catch (error) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// Get opportunity by ID
router.get('/:id', optionalAuth, async (req: any, res) => {
  try {
    const { id } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            industry: true,
            size: true,
            website: true,
            logoUrl: true,
            description: true,
          },
        },
      },
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json(opportunity);
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// Apply to opportunity
router.post('/:id/apply', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if opportunity exists
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.status !== 'active') {
      return res.status(400).json({ error: 'Opportunity is not active' });
    }

    // Check if user already applied
    const existingApplication = await prisma.opportunityApplication.findUnique({
      where: {
        userId_opportunityId: {
          userId: req.user.id,
          opportunityId: id,
        },
      },
    });

    if (existingApplication) {
      return res.status(409).json({ error: 'Already applied to this opportunity' });
    }

    // Create application
    const application = await prisma.opportunityApplication.create({
      data: {
        userId: req.user.id,
        opportunityId: id,
        message,
        status: 'pending',
      },
    });

    // Update opportunity application count
    await prisma.opportunity.update({
      where: { id },
      data: {
        applications: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Apply to opportunity error:', error);
    res.status(500).json({ error: 'Failed to apply to opportunity' });
  }
});

export default router;