import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  currentChannelId: null,
};

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setChannels(state, action) {
      const { channels, currentChannelId } = action.payload;
      state.items = channels;
      state.currentChannelId = currentChannelId;
    },
    setCurrentChannelId(state, action) {
      state.currentChannelId = action.payload;
    },
    addChannel(state, action) {
      const ch = action.payload;
      const exists = state.items.some((c) => String(c.id) === String(ch.id));
      if (!exists) state.items.push(ch);
    },
    removeChannel(state, action) {
      const id = String(action.payload);
      state.items = state.items.filter((c) => String(c.id) !== id);
    },
    renameChannel(state, action) {
      const { id, name } = action.payload;
      const ch = state.items.find((c) => String(c.id) === String(id));
      if (ch) ch.name = name;
    },
  },
});

export const {
  setChannels,
  setCurrentChannelId,
  addChannel,
  removeChannel,
  renameChannel,
} = channelsSlice.actions;

export default channelsSlice.reducer;