import express from 'express';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Case from '../models/Case';

// Custom interface for authenticated requests
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

// Get all cases for an affiliate
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, startDate, endDate } = req.query;
    const query: any = { affiliateId: req.user?.id };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const cases = await Case.find(query).sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cases' });
  }
});

// Get case statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cases = await Case.find({ affiliateId: req.user?.id });
    const stats = {
      total: cases.length,
      pending: cases.filter(c => c.status === 'pending').length,
      won: cases.filter(c => c.status === 'won').length,
      lost: cases.filter(c => c.status === 'lost').length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching case statistics' });
  }
});

// Create new case
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { flightNumber, airline, description } = req.body;
    const newCase = new Case({
      affiliateId: req.user?.id,
      flightNumber,
      airline,
      description,
      status: 'pending'
    });

    await newCase.save();
    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: 'Error creating case' });
  }
});

// Update case status
router.patch('/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const updatedCase = await Case.findOneAndUpdate(
      { _id: req.params.id, affiliateId: req.user?.id },
      { status },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(updatedCase);
  } catch (error) {
    res.status(500).json({ message: 'Error updating case status' });
  }
});

export default router; 