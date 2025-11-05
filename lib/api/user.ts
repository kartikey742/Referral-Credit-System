import apiClient from './client';

interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  credits: number;
  hasMadePurchase: boolean;
  referredBy?: string; 
  createdAt: string;
}

interface ReferralDetail {
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
}

interface DashboardResponse {
  success: boolean;
  data: {
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
    referrals: ReferralDetail[];
  };
}

interface PurchaseResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    credits: number;
    hasMadePurchase: boolean;
  };
}

interface MeResponse {
  success: boolean;
  user: User;
}

export const getMe = async (): Promise<MeResponse> => {
  try {
    const response = await apiClient.get<MeResponse>('/user/me');
    return response.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Failed to fetch user';
    throw new Error(message);
  }
};

export const getDashboard = async (): Promise<DashboardResponse> => {
  try {
    const response = await apiClient.get<DashboardResponse>('/user/dashboard');
    return response.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Failed to fetch dashboard';
    throw new Error(message);
  }
};

export const makePurchase = async (): Promise<PurchaseResponse> => {
  try {
    const response = await apiClient.post<PurchaseResponse>('/user/purchase');
    return response.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Failed to make purchase';
    throw new Error(message);
  }
};
