import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    roomcodes:[]
}
const roomSlice = createSlice({
    name:"userroom",
    initialState,
    reducers:{
        setRoomCodes: (state,action)=>{
            // console.log("dispatcher",action.payload);
            state.roomcodes = action.payload;
        },
        deleteRoomCode:(state,action)=>{
            state.roomcodes = state.roomcodes.filter(code => code!==action.payload)
        },
        clearRoomCodes: (state,action)=>{
            state.roomcodes = [];
        }
    }
})

export const {setRoomCodes,clearRoomCodes,deleteRoomCode} = roomSlice.actions;

export default roomSlice.reducer;