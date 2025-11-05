import express, { Response } from 'express';
import User from '../models/User';
import Referral from '../models/Referral';
import { authenticate, AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
        credits: user.credits,
        hasMadePurchase: user.hasMadePurchase,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const referrals = await Referral.find({ referrerId: user.referralCode }).sort({ createdAt: -1 });

    const referralDetails = await Promise.all(
      referrals.map(async (referral) => {
        const referredUser = await User.findOne({ referralCode: referral.referredUserId }).select('name email createdAt');
        return {
          id: referral._id,
          referredUser: referredUser ? {
            name: referredUser.name,
            email: referredUser.email,
            joinedAt: referredUser.createdAt,
          } : null,
          status: referral.status,
          creditsAwarded: referral.creditsAwarded,
          createdAt: referral.createdAt,
          purchaseDate: referral.purchaseDate,
        };
      })
    );

    const totalReferredUsers = referrals.length;
    const convertedUsers = referrals.filter((r) => r.status === 'converted').length;

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          credits: user.credits,
          hasMadePurchase: user.hasMadePurchase,
        },
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?ref=${user.referralCode}`,
        stats: {
          totalCredits: user.credits,
          totalReferredUsers,
          convertedUsers,
          pendingUsers: totalReferredUsers - convertedUsers,
        },
        referrals: referralDetails,
      },
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

router.post('/purchase', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.userId).session(session);

    if (!user) {
      await session.abortTransaction();
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (user.hasMadePurchase) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: 'You have already made a purchase. Credits can only be earned once.',
      });
      return;
    }
    user.hasMadePurchase = true;
    user.credits += 2; // User earns 2 credits for their first purchase
    await user.save({ session });

    let referrerAwarded = false;
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy }).session(session);

      if (referrer) {
        const referralRecord = await Referral.findOne({
          referrerId: referrer.referralCode,
          referredUserId: user.referralCode,
        }).session(session);

        if (referralRecord && !referralRecord.creditsAwarded) {
          referrer.credits += 2;
          await referrer.save({ session });
          referralRecord.status = 'converted';
          referralRecord.creditsAwarded = true;
          referralRecord.purchaseDate = new Date();
          await referralRecord.save({ session });

          referrerAwarded = true;
        }
      }
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: referrerAwarded
        ? 'Purchase successful! You and your referrer earned 2 credits each.'
        : 'Purchase successful! You earned 2 credits.',
      user: {
        id: user._id,
        credits: user.credits,
        hasMadePurchase: user.hasMadePurchase,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during purchase',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

export default router;