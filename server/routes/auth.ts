import express, { Request, Response } from 'express';
import User from '../models/User';
import Referral from '../models/Referral';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { generateReferralCode } from '../utils/generateReferralCode';

const router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, referralCode } = req.body;
    console.log(referralCode);

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    let userReferralCode = generateReferralCode(name);
    let codeExists = await User.findOne({ referralCode: userReferralCode });

    while (codeExists) {
      userReferralCode = generateReferralCode(name);
      codeExists = await User.findOne({ referralCode: userReferralCode });
    }

    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      referralCode: userReferralCode,
    });

    if (referralCode) {
      const referrer = await User.findOne({
        referralCode: referralCode.toUpperCase(),
      });

      if (referrer) {
        user.referredBy = referrer.referralCode;
        await user.save();

        try {
          await Referral.create({
            referrerId: referrer.referralCode,
            referredUserId: user.referralCode,
            status: 'pending',
          });
        } catch (error) {
          console.log('Referral record exists or error creating it');
        }
      } else {
        await user.save();
      }
    } else {
      await user.save();
    }

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        credits: user.credits,
        hasMadePurchase: user.hasMadePurchase,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        credits: user.credits,
        hasMadePurchase: user.hasMadePurchase,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
});

export default router;