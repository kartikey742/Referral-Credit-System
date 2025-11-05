'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout, updateUser } from '@/lib/store/slices/authSlice';
import { getDashboard, makePurchase } from '@/lib/api/user';

interface DashboardData {
  user: {
    name: string;
    email: string;
    referralCode: string;
    credits: number;
    hasMadePurchase: boolean;
  }; 
  referralLink: string;
  stats: {
    totalCredits: number;
    totalReferredUsers: number;
    convertedUsers: number;
    pendingUsers: number;
  };
  referrals: Array<{
    id: string;
    referredUser: {
      name: string;
      email: string;
      joinedAt: string;
    } | null;
    status: 'pending' | 'converted';
    creditsAwarded: boolean;
    createdAt: string;
    purchaseDate?: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
  }, [isAuthenticated]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getDashboard();
      setDashboardData(response.data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (dashboardData?.referralLink) {
      navigator.clipboard.writeText(dashboardData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePurchase = async () => {
    if (user?.hasMadePurchase) {
      setError('You have already made a purchase!');
      return;
    }

    try {
      setPurchaseLoading(true);
      setError('');
      const response = await makePurchase();
      setSuccessMessage(response.message);
      
      dispatch(updateUser({
        credits: response.user.credits,
        hasMadePurchase: response.user.hasMadePurchase,
      }));

      await fetchDashboard();

      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white">
                R
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {dashboardData.user.name}!
                </h1>
                <p className="text-sm text-gray-500">{dashboardData.user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg bg-green-50 p-4 text-green-800"
          >
            {successMessage}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg bg-red-50 p-4 text-red-800"
          >
            {error}
          </motion.div>
        )}

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Credits"
            value={dashboardData.stats.totalCredits}
            icon="💰"
            color="blue"
          />
          <StatCard
            title="Referred Users"
            value={dashboardData.stats.totalReferredUsers}
            icon="👥"
            color="purple"
          />
          <StatCard
            title="Converted Users"
            value={dashboardData.stats.convertedUsers}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Pending Users"
            value={dashboardData.stats.pendingUsers}
            icon="⏳"
            color="orange"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl bg-white p-6 shadow-xl"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Your Referral Link</h2>
          <p className="mb-4 text-gray-600">
            Share this link with friends. You'll both earn 2 credits when they make their first purchase!
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={dashboardData.referralLink}
              readOnly
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-700"
            />
            <button
              onClick={handleCopyLink}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white hover:scale-105 transition-transform"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Your referral code: <span className="font-semibold">{dashboardData.user.referralCode}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl bg-white p-6 shadow-xl"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Make a Purchase</h2>
          <p className="mb-4 text-gray-600">
            Simulate a purchase to earn credits. You can only purchase once!
          </p>
          <button
            onClick={handlePurchase}
            disabled={purchaseLoading || user?.hasMadePurchase}
            className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-3 font-semibold text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {purchaseLoading ? 'Processing...' : user?.hasMadePurchase ? 'Already Purchased' : 'Buy Product ($10)'}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-6 shadow-xl"
        >
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Your Referrals</h2>
          {dashboardData.referrals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No referrals yet. Share your link to get started!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">User</th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-700">Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-900">
                        {referral.referredUser?.name || 'Unknown'}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {referral.referredUser?.email || 'N/A'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            referral.status === 'converted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {referral.purchaseDate
                          ? new Date(referral.purchaseDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-white p-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} text-2xl`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}