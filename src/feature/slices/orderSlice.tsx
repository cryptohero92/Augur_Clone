import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const orderBookState = {
    orders: [],
    loading: false,
    showNo: false
};

export const fetchOrders = createAsyncThunk(
    "order/fetchOrders",
    async ({bettingOptionIndex}) => {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/orders/${bettingOptionIndex}`);
        return response.data;
    }
)

export const deleteOrder = createAsyncThunk(
    "order/cancel",
    async({_id}) => {
        const response = await axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/order/${_id}`);
        return response.data;
    }
)

export const deleteAllOrdersFor = createAsyncThunk(
    "order/cancelAll",
    async({wallet, bettingOptionIndex}) => {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/order/deleteAll`, {
            wallet,
            bettingOptionIndex
        });
        return response.data;
    }
)

export const sendOrderRequest = createAsyncThunk(
    "order/sendRequest",
    async ({ selectedBettingOption, bettingStyle, buyOrSell, yesOrNo, amount, limitPrice, shares, wallet }) => {
        const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/order`, {
            bettingOptionIndex: selectedBettingOption.ipfsUrl,
            bettingStyle,
            buyOrSell,
            yesOrNo,
            amount,
            limitPrice,
            shares,
            wallet
        });
        return response.data;
    }
)

const orderSlice = createSlice({
    name: "order",
    initialState: orderBookState,
    reducers: {
        createOrder: (state, action) => {
            state.orders.push(action.payload);
        },
        updateOrder: (state, action) => {
            const index = state.orders.findIndex(order => order._id === action.payload._id);
            if (index !== -1) {
                state.orders[index] = action.payload;
            } else {
                state.orders.push(action.payload); // If not found, add the new item to the array
            }
        },
        removeOrder: (state, action) => {
            console.log(action.payload);
            state.orders = state.orders.filter(order => order._id != action.payload._id);
        },
        setShowNo: (state, action) => {
            state.showNo = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.status == 200) {
                    state.orders = action.payload.orders;
                }
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false;
            })
    }
});

export default orderSlice.reducer;

export const { createOrder, updateOrder, removeOrder, setShowNo } = orderSlice.actions;
