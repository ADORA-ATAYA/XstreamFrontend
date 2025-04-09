import { createSlice } from "@reduxjs/toolkit";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../helper/FireBaseAuth";
import axios from "axios";

const initialState={
    user:null,
    isLoading:true,
}


const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        setUser: (state, action) => {
            state.user = action.payload;
            state.isLoading = false;
          },
        clearUser: (state) => {
            state.user = null;
            state.isLoading = false
        },
    }
})

export const listenToAuthChanges = () => (dispatch) => {
  console.log("react_APP url",process.env.REACT_APP_BASE_URL);
  
    onAuthStateChanged(auth, async(user) => {
      if (user) {
        const token = await user.getIdToken();                 
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/register`, {}, { headers: { Authorization: `Bearer ${token}` } });     
        dispatch(setUser(response.data));
      } else {
        dispatch(clearUser());
      }
    });
  };

export const {setUser,clearUser} = authSlice.actions

export default authSlice.reducer