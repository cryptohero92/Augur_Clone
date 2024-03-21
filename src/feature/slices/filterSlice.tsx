import { createSlice } from '@reduxjs/toolkit'

export const filterSlice = createSlice({
  name: 'filter',
  initialState: {
    Volume: 0,
    EndDate: 0,
    Status: 1
  },
  reducers: {
    changeVolume: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.Volume = action.payload;
    },
    changeEndDate: (state, action) => {
      state.EndDate = action.payload;
    },
    changeStatus: (state, action) => {
      state.Status = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { changeVolume, changeEndDate, changeStatus } = filterSlice.actions;

export default filterSlice.reducer;