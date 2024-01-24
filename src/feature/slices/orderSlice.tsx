import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const orderBookState = {
    orders: [],
    loading: false,
    showNo: false
};

const orderSlice = createSlice({
    name: "order",
    initialState: orderBookState,
    reducers: {
        setShowNo: (state, action) => {
            state.showNo = action.payload;
        }
    }
});

export default orderSlice.reducer;

export const { setShowNo } = orderSlice.actions;
