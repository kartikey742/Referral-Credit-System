import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  credits: number;
  hasMadePurchase: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

if (typeof window !== 'undefined') {
  const savedAuth = localStorage.getItem('auth');
  if (savedAuth) {
    try {
      const parsed = JSON.parse(savedAuth);
      initialState.user = parsed.user;
      initialState.token = parsed.token;
      initialState.isAuthenticated = !!parsed.token;
    } catch (error) {
      console.error('Error parsing saved auth:', error);
    }
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
        }));
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify({
            user: state.user,
            token: state.token,
          }));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;