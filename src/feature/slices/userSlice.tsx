import { createSlice } from "@reduxjs/toolkit";
import { UserInfo } from "../../types";


const initialState: UserInfo = {
    id: 0,
    correspondingAddress: ''
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.id = action.payload.id;
            state.correspondingAddress = action.payload.correspondingAddress
        }
    }
});

export default userSlice.reducer;
export const { setUserInfo } = userSlice.actions;