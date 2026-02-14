import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  currentChannelId: null,
};

const toStr = (v) => (v == null ? null : String(v));

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setChannels(state, action) {
      const { channels, currentChannelId } = action.payload;
      state.items = channels;
      state.currentChannelId = toStr(currentChannelId);
    },
    setCurrentChannelId(state, action) {
      state.currentChannelId = toStr(action.payload);
    },
  },
});

export const { setChannels, setCurrentChannelId } = channelsSlice.actions;
export default channelsSlice.reducer;