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
            state = action.payload;
        }
    }
});

export default userSlice.reducer;
export const { setUserInfo } = userSlice.actions;