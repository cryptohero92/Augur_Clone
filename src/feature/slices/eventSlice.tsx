import { createSlice } from "@reduxjs/toolkit";
import { PublishedEventInfo } from "../../types";

export const eventSlice = createSlice({
  name: "event",
  initialState: {
    publishedEvents: [] as PublishedEventInfo[],
    selectedBettingOption: null
  },
  reducers: {
    setPublishedEvents: (state, action) => {
        state.publishedEvents = action.payload as PublishedEventInfo[]
    },
    updatePublishedEvent: (state, action) => {
      state.publishedEvents = [...state.publishedEvents.filter(event => {
        return action.payload.ipfsUrl != event.ipfsUrl
      }), action.payload as PublishedEventInfo]
    },
    selectBettingOption:(state, action) => {
      state.selectedBettingOption = action.payload;
    }
  },
});

export default eventSlice.reducer;
export const { setPublishedEvents, updatePublishedEvent, selectBettingOption } = eventSlice.actions;
