'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import './globals.css';
export default function Home() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white shadow-lg">
            R
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 text-5xl font-bold text-gray-900 md:text-6xl"
        >
          Referral & Credit System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 text-xl text-gray-600 md:text-2xl"
        >
          Earn credits by referring friends and grow together
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12 grid gap-6 md:grid-cols-3"
        >
          <FeatureCard
            icon="🎁"
            title="Earn Credits"
            description="Get 2 credits when your referrals make their first purchase"
          />
          <FeatureCard
            icon="🔗"
            title="Share Your Link"
            description="Easy-to-share referral link with tracking"
          />
          <FeatureCard
            icon="📊"
            title="Track Progress"
            description="Monitor your referrals and earnings in real-time"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-lg border-2 border-gray-300 bg-white px-8 py-4 font-semibold text-gray-700 shadow-md transition-all hover:scale-105 hover:border-gray-400"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 grid gap-8 md:grid-cols-3"
        >
          <StatCard number="1000+" label="Active Users" />
          <StatCard number="5000+" label="Referrals Made" />
          <StatCard number="10K+" label="Credits Earned" />
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
      <div className="mb-3 text-4xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="mb-1 text-3xl font-bold text-gray-900">{number}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}