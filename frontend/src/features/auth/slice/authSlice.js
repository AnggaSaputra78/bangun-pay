import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'))

const initialState = {
  user: user || null,
  isAuthenticated: !!user,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
}

// Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed'
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.login(userData)
      console.log('Login response:', response)
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || error.message || 'Login failed'
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await authService.logout()
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message)
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false
      state.isSuccess = false
      state.isError = false
      state.message = ''
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false
        state.isSuccess = true
        state.message = 'Registration successful'
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.isSuccess = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
        state.user = null
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
      })
  },
})

export const { reset, clearUser } = authSlice.actions
export default authSlice.reducer