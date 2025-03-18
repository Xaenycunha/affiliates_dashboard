import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
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

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find affiliate
    const affiliate = await Affiliate.findOne({ email });
    if (!affiliate) {
      // Return success even if email doesn't exist (security best practice)
      return res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    affiliate.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    affiliate.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await affiliate.save();

    // TODO: Send email with reset link
    // For development, we'll just log the token
    console.log('Reset token:', resetToken);
    console.log('Reset link:', `http://localhost:3000/reset-password?token=${resetToken}`);

    res.json({ message: 'If an account exists with this email, you will receive password reset instructions.' });
  } catch (error: any) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find affiliate with valid token
    const affiliate = await Affiliate.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!affiliate) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    affiliate.password = password;
    affiliate.resetPasswordToken = undefined;
    affiliate.resetPasswordExpire = undefined;

    await affiliate.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error: any) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

export default router; 