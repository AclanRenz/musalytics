import express from 'express';
import nodemailer from 'nodemailer';
import { auth, db } from '../config/firebase-config.js';
import { generateVerificationCode } from '../utils/verification.js';

const router = express.Router();

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Google Sign In route - Updated with better error handling and validation
router.post('/google', async (req, res) => {
  try {
    const { idToken, user } = req.body;

    if (!idToken || !user) {
      return res.status(400).json({ error: 'Missing idToken or user data' });
    }

    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Verify UID matches
    if (decodedToken.uid !== user.uid) {
      return res.status(401).json({ error: 'Unauthorized: Token mismatch' });
    }
    
    // Get or create user profile in Firestore
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    const userData = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: 'google',
      isVerified: true,
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };
    
    if (!userDoc.exists) {
      // Create new user profile
      await userRef.set({
        ...userData,
        createdAt: new Date().toISOString(),
        preferences: {
          notifications: true,
          newsletter: false
        }
      });
    } else {
      // Update existing user
      await userRef.update(userData);
    }

    // Get the updated user profile
    const updatedUserDoc = await userRef.get();
    const updatedUserData = updatedUserDoc.data();

    // Create custom token with extended expiration
    const token = await auth.createCustomToken(user.uid);

    res.json({
      token,
      user: {
        uid: user.uid,
        ...updatedUserData
      }
    });
  } catch (error) {
    console.error('Google sign in error:', error);
    res.status(400).json({ 
      error: error.message,
      code: error.code || 'unknown_error'
    });
  }
});

// Keep all existing routes the same
router.post('/register', async (req, res) => {
  console.log('Register request received:', req.body);
  
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      console.log('Missing required fields:', { firstName, lastName, email, password: '***' });
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'password'],
        received: Object.keys(req.body)
      });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: false
    });

    const verificationCode = generateVerificationCode();

    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
      displayName: `${firstName} ${lastName}`,
      createdAt: new Date().toISOString(),
      isVerified: false,
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 30 * 60000),
      provider: 'email',
      preferences: {
        notifications: true,
        newsletter: false
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering! Please verify your email address.</p>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 30 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: 'Verification code sent to your email',
      userId: userRecord.uid
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/verify-code', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'Missing userId or verification code' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (userData.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    if (userData.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (new Date() > new Date(userData.verificationCodeExpires)) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    await Promise.all([
      auth.updateUser(userId, { emailVerified: true }),
      db.collection('users').doc(userId).update({
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
        updatedAt: new Date().toISOString()
      })
    ]);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    if (userData.isVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 30 * 60000);

    await db.collection('users').doc(userId).update({
      verificationCode,
      verificationCodeExpires,
      updatedAt: new Date().toISOString()
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userData.email,
      subject: 'New Verification Code',
      html: `
        <h1>New Verification Code</h1>
        <p>Hello ${userData.firstName},</p>
        <p>Here is your new verification code:</p>
        <p><strong>${verificationCode}</strong></p>
        <p>This code will expire in 30 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'New verification code sent' });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const userCredential = await auth.getUserByEmail(email);
    
    if (!userCredential.emailVerified) {
      return res.status(400).json({ 
        error: 'Email not verified',
        userId: userCredential.uid
      });
    }

    const userDoc = await db.collection('users').doc(userCredential.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();

    // Update last login time
    await db.collection('users').doc(userCredential.uid).update({
      lastLoginAt: new Date().toISOString()
    });

    const token = await auth.createCustomToken(userCredential.uid);

    res.json({
      token,
      user: {
        uid: userCredential.uid,
        email: userCredential.email,
        displayName: userCredential.displayName,
        ...userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    res.json({
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const link = await auth.generatePasswordResetLink(email);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${link}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;