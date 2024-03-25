import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BettingOptionInfo, PublishedEventInfo } from "../../types";

export const selectBettingOption = createAsyncThunk(
  'event/selectBettingOption',
  async (payload: any) => {
    const { ipfsUrl, ...otherProperties } = payload;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/contract/getTokenIds/${ipfsUrl}`);
      const { yesTokenId, noTokenId } = await response.json();
      return { ipfsUrl, yesTokenId, noTokenId, ...otherProperties };
    } catch (error) {
      console.error(error);
      return error;
    }
  }
);

export const eventSlice = createSlice({
  name: "event",
  initialState: {
    publishedEvents: [] as PublishedEventInfo[],
    selectedBettingOption: null as BettingOptionInfo | null,
  },
  reducers: {
    setPublishedEvents: (state, action) => {
      state.publishedEvents = action.payload as PublishedEventInfo[];
    },
    updatePublishedEvent: (state, action) => {
      state.publishedEvents = [...state.publishedEvents.filter(event => {
        return action.payload.ipfsUrl !== event.ipfsUrl;
      }), action.payload as PublishedEventInfo].sort((a, b) => a.indexInArray - b.indexInArray);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(selectBettingOption.fulfilled, (state, action) => {
      state.selectedBettingOption = { ...action.payload };
    });
  },
});

export default eventSlice.reducer;
export const { setPublishedEvents, updatePublishedEvent } = eventSlice.actions;