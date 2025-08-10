import express from 'express';
import { authenticateToken } from '../middleware/auth';
import prisma from '../config/database';

const router = express.Router();

// Get user's NFTs
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const nfts = await prisma.nFTToken.findMany({
      where: { userId: req.user.id },
      include: {
        achievement: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(nfts);
  } catch (error) {
    console.error('Get NFTs error:', error);
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

// Mint NFT from achievement
router.post('/mint', authenticateToken, async (req: any, res) => {
  try {
    const { achievementId } = req.body;

    // Check if achievement exists and is verified
    const achievement = await prisma.achievement.findFirst({
      where: {
        id: achievementId,
        userId: req.user.id,
        verified: true,
      },
    });

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found or not verified' });
    }

    // Check if NFT already exists for this achievement
    const existingNFT = await prisma.nFTToken.findFirst({
      where: {
        achievementId,
        userId: req.user.id,
      },
    });

    if (existingNFT) {
      return res.status(409).json({ error: 'NFT already minted for this achievement' });
    }

    // Create NFT record
    const nft = await prisma.nFTToken.create({
      data: {
        userId: req.user.id,
        achievementId,
        tokenId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        contractAddress: '0x0000000000000000000000000000000000000000', // Demo address
        blockchain: 'polygon',
        nftType: achievement.type === 'gpa' ? 'gpa_guardian' : 
                achievement.type === 'research' ? 'research_rockstar' : 'leadership_legend',
        metadataUri: `https://api.academicnft.com/metadata/${achievement.id}`,
        minted: true,
        mintedAt: new Date(),
        level: 1,
        rarity: 'common',
      },
      include: {
        achievement: true,
      },
    });

    res.status(201).json({
      message: 'NFT minted successfully',
      nft,
    });
  } catch (error) {
    console.error('Mint NFT error:', error);
    res.status(500).json({ error: 'Failed to mint NFT' });
  }
});

export default router;