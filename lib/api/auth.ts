import apiClient from './client';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    referralCode: string;
    credits: number;
    hasMadePurchase: boolean;
  };
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Registration failed';
    throw new Error(message);
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Login failed';
    throw new Error(message);
  }
};