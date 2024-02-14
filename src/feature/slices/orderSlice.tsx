import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { OrderDeleteAllRequestInfo, OrderDeleteRequestInfo, OrderRequestInfo } from "../../types";

const orderBookState = {
    orders: [],
    loading: false,
    showNo: false
};

export const fetchOrders = createAsyncThunk(
    "order/fetchOrders",
    async ({bettingOptionUrl}: {bettingOptionUrl: string}) => {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/orders?bettingOptionUrl=${bettingOptionUrl}`);
        return response.data;
    }
)

export const deleteOrder = createAsyncThunk(
    "order/cancel",
    async({_id, accessToken}: OrderDeleteRequestInfo) => {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/orders/${_id}`, {
            headers
        });
        return response.data;
    }
)

export const deleteAllOrdersFor = createAsyncThunk(
    "order/cancelAll",
    async({bettingOptionUrl, accessToken}: OrderDeleteAllRequestInfo) => {
        const headers = { Authorization: `Bearer ${accessToken}` };
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
            headers,
            data: { bettingOptionUrl }
        });
        return response.data;
    }
)

export const sendOrderRequest = createAsyncThunk(
    "order/sendRequest",
    async ({ selectedBettingOption, bettingStyle, buyOrSell, yesOrNo, amount, limitPrice, shares, accessToken } : OrderRequestInfo) => {
        debugger
        const headers = { Authorization: `Bearer ${accessToken}` };

        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/orders`, {
            bettingOptionUrl: selectedBettingOption.ipfsUrl,
            bettingStyle,
            buyOrSell,
            yesOrNo,
            amount,
            limitPrice,
            shares
        }, { headers });
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
            .addCase(fetchOrders.rejected, (state, _) => {
                state.loading = false;
            })
    }
});

export default orderSlice.reducer;

export const { createOrder, updateOrder, removeOrder, setShowNo } = orderSlice.actions;
