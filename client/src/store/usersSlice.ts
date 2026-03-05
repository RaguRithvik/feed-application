import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UsersState, User } from '../types';

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
};

// Fetch users from local JSON server
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await fetch('/api/users');
  const data = await response.json();
  return data.map((user: any) => ({
    id: String(user.id),
    name: user.name,
    username: user.username,
    password: user.password || '',
  }));
});

// Register a new user (persist to JSON server)
export const registerUser = createAsyncThunk(
  'users/registerUser',
  async (userData: User) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return await response.json();
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // Register user
      .addCase(registerUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to register user';
      });
  },
});

export const { setError, clearError } = usersSlice.actions;
export default usersSlice.reducer;
