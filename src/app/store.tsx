import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "../feature/slices/userSlice";
import categorySlice from "../feature/slices/categorySlice";
import filterSlice from "../feature/slices/filterSlice";
import eventSlice from "../feature/slices/eventSlice";
import orderSlice from "../feature/slices/orderSlice";

const rootReducer = combineReducers({
  userKey: userSlice,
  categoryKey: categorySlice,
  filterKey: filterSlice,
  eventKey: eventSlice,
  orderKey: orderSlice,
});

const store = configureStore({
  reducer: rootReducer
})

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;