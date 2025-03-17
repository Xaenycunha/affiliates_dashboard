import express from 'express';
import jwt from 'jsonwebtoken';
import Affiliate from '../models/Affiliate';
import { generateReferralCode } from '../utils/referral';

const router = express.Router();

// Register new affiliate
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({ email });
    if (existingAffiliate) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new affiliate
    const affiliate = new Affiliate({
      name,
      email,
      password,
      referralCode: generateReferralCode()
    });

    await affiliate.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: affiliate._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      affiliate: {
        id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating affiliate' });
  }
});

// Login affiliate
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find affiliate
    const affiliate = await Affiliate.findOne({ email });
    if (!affiliate) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await affiliate.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: affiliate._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      affiliate: {
        id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

export default router; 