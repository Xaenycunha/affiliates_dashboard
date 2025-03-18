import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Affiliate from '../models/Affiliate';
import Visit from '../models/Visit';
import Case from '../models/Case';

// Extend the Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: Function) => {
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

// Get affiliate profile
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const affiliate = await Affiliate.findById(req.user?.id).select('-password');
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    res.json(affiliate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update affiliate profile
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, country, bankName, bankAccount, bankAgency, bankType, pixKey } = req.body;
    const affiliate = await Affiliate.findByIdAndUpdate(
      req.user?.id,
      { name, email, phone, country, bankName, bankAccount, bankAgency, bankType, pixKey },
      { new: true }
    ).select('-password');

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    res.json(affiliate);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get affiliate dashboard data
router.get('/dashboard', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { dateRange } = req.query;
    const affiliateId = req.user?.id;

    // Calculate date range based on the parameter
    let startDate = new Date();
    let endDate = new Date();

    switch (dateRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to 7 days
    }

    // Get visits count
    const visits = await Visit.find({
      affiliateId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).count();

    // Get cases statistics
    const cases = await Case.find({ 
      affiliateId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
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
      totalVisits: visits,
      cases: casesStats,
      affiliate
    });
  } catch (error) {
    console.error('Dashboard error:', error);
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