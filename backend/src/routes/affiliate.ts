import express from 'express';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Affiliate from '../models/Affiliate';
import Visit from '../models/Visit';
import Case from '../models/Case';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Update affiliate profile
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phone, bankData } = req.body;
    const affiliate = await Affiliate.findByIdAndUpdate(
      req.user.id,
      { phone, bankData },
      { new: true }
    );

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    res.json(affiliate);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get affiliate dashboard data
router.get('/dashboard', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const affiliateId = req.user.id;

    // Get visits count
    const visits = await Visit.find({
      affiliateId,
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).count();

    // Get cases statistics
    const cases = await Case.find({ affiliateId });
    const casesStats = {
      total: cases.length,
      pending: cases.filter(c => c.status === 'pending').length,
      won: cases.filter(c => c.status === 'won').length,
      lost: cases.filter(c => c.status === 'lost').length
    };

    // Get affiliate data
    const affiliate = await Affiliate.findById(affiliateId)
      .select('-password');

    res.json({
      visits,
      casesStats,
      affiliate
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Track visit
router.post('/track-visit', async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.query;
    const { ipAddress, userAgent } = req.body;

    const affiliate = await Affiliate.findOne({ referralCode });
    if (!affiliate) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }

    const visit = new Visit({
      affiliateId: affiliate._id,
      ipAddress,
      userAgent
    });

    await visit.save();

    res.status(201).json({ message: 'Visit tracked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error tracking visit' });
  }
});

export default router; 