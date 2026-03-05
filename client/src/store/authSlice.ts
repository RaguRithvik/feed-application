import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../types';

const loadUserFromCookie = (): User | null => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('user='));
  if (cookie) {
    try {
      return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    } catch {
      return null;
    }
  }
  return null;
};

const savedUser = loadUserFromCookie();

const initialState: AuthState = {
  isAuthenticated: !!savedUser,
  currentUser: savedUser,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.currentUser = action.payload;
      state.error = null;
      // Save to cookie
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `user=${encodeURIComponent(JSON.stringify(action.payload))}; expires=${expires}; path=/`;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.error = null;
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
