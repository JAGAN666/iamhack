import express from 'express';

const router = express.Router();

// Placeholder for multichain functionality
router.get('/status', (req, res) => {
  res.json({
    message: 'Multichain service is ready',
    chains: ['ethereum', 'polygon', 'solana'],
    status: 'active',
  });
});

export default router;