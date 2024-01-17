import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CategoryState } from '../../types';

const initialState: CategoryState = {
  keywords: [
    {
      name: 'Crypto',
      subcategories: ['Prices'],
    },
    {
      name: 'Politics',
      subcategories: ['Elections', 'Middle East', 'USA Politics'],
    },
    {
      name: 'Science',
      subcategories: ['Academia', 'Climate & Weather', 'Space'],
    },
    {
      name: 'Sports',
      subcategories: ['Basketball', 'Soccer'],
    },
    // Add more categories and subcategories as needed
  ],
  activeList: [],
};

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    addCategoryToActiveList: (state, action: PayloadAction<string>) => {
      if (!state.activeList.includes(action.payload)) {
        state.activeList.push(action.payload);
      }
    },
    removeCategoryFromActiveList: (state, action: PayloadAction<string>) => {
      state.activeList = state.activeList.filter(activeCategory => activeCategory !== action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addCategoryToActiveList, removeCategoryFromActiveList } = categorySlice.actions;

export default categorySlice.reducer;