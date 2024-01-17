import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "../feature/slices/userSlice";
import categorySlice from "../feature/slices/categorySlice";
import filterSlice from "../feature/slices/filterSlice";

const rootReducer = combineReducers({
  userKey: userSlice,
  categoryKey: categorySlice,
  filterKey: filterSlice,
});

const store = configureStore({
  reducer: rootReducer
})

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;