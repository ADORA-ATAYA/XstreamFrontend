import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../redux/slices/authSlice'
import roomReducer from  '../redux/slices/roomSlice'


export const store = configureStore({
  reducer: {
    auth:authReducer,
    userroom:roomReducer,
  },
})