import { createSlice } from "@reduxjs/toolkit";
import { PublishedEventInfo } from "../../types";

export const eventSlice = createSlice({
  name: "event",
  initialState: {
    publishedEvents: [] as PublishedEventInfo[]
  },
  reducers: {
    setPublishedEvents: (state, action) => {
        state.publishedEvents = action.payload as PublishedEventInfo[]
    },
    updatePublishedEvent: (state, action) => {
      state.publishedEvents = [...state.publishedEvents.filter(event => {
        return action.payload.ipfsUrl != event.ipfsUrl
      }), action.payload as PublishedEventInfo]
    }
  },
});

export default eventSlice.reducer;
export const { setPublishedEvents, updatePublishedEvent } = eventSlice.actions;
