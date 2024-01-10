import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "../feature/slices/userSlice";

const rootReducer = combineReducers({
  userKey: userSlice,
});

const store = configureStore({
  reducer: rootReducer
})

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;