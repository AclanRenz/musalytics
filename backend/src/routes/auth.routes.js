import express from 'express';
import { auth, db } from '../config/firebase-config.js';
import { generateVerificationCode } from '../utils/verification.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure nodemailer (replace with your email service credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Register new user
router.post('/register', async (req, res) => {
  console.log('Register request received:', req.body);
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'name'],
        received: Object.keys(req.body)
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false
    });

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store verification code in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      createdAt: new Date().toISOString(),
      isVerified: false,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 30 * 60000) // 30 minutes expiry
    });

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Hello ${name},</p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 30 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'User created successfully. Please check your email for verification code.',
      userId: userRecord.uid
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Verify email with code
router.post('/verify-code', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and verification code are required' });
    }

    // Get user document from Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Check if code is expired
    if (new Date() > new Date(userData.verificationCodeExpires)) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    // Check if code matches
    if (userData.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Update user verification status
    await auth.updateUser(userId, {
      emailVerified: true
    });

    await db.collection('users').doc(userId).update({
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verificationCode: null,
      verificationCodeExpires: null
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    if (userData.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Update verification code in Firestore
    await db.collection('users').doc(userId).update({
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 30 * 60000)
    });

    // Send new verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: 'New Verification Code',
      html: `
        <h1>New Verification Code</h1>
        <p>Hello ${userData.name},</p>
        <p>Your new verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 30 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'New verification code sent' });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login remains the same but checks isVerified in Firestore
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    
    // Check if email is verified in Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    if (!userData.isVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Generate custom token
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});




export default router;