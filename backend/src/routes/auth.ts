import express from 'express';
import jwt from 'jsonwebtoken';
import Affiliate from '../models/Affiliate';
import { generateReferralCode } from '../utils/referral';

const router = express.Router();

// Register new affiliate
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration request:', req.body);
    const { name, email, password } = req.body;

    // Check if affiliate already exists
    console.log('Checking if affiliate exists...');
    const existingAffiliate = await Affiliate.findOne({ email });
    if (existingAffiliate) {
      console.log('Affiliate already exists');
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate referral code
    console.log('Generating referral code...');
    const referralCode = await generateReferralCode();
    console.log('Generated referral code:', referralCode);

    // Create new affiliate with the resolved referral code
    console.log('Creating new affiliate...');
    const affiliate = new Affiliate({
      name,
      email,
      password,
      referralCode: referralCode // This is now a string, not a Promise
    });

    console.log('Saving affiliate...');
    await affiliate.save();
    console.log('Affiliate saved successfully');

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { id: affiliate._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Registration successful');
    res.status(201).json({
      token,
      affiliate: {
        id: affiliate._id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode
      }
    });
  } catch (error: any) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Error creating affiliate', error: error.message });
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
  } catch (error: any) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

export default router; 