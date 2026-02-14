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
    addChannel(state, action) {
      state.items.push(action.payload);
    },
    removeChannel(state, action) {
      const id = toStr(action.payload);
      state.items = state.items.filter((c) => toStr(c.id) !== id);
    },
    renameChannel(state, action) {
      const { id, name } = action.payload;
      const strId = toStr(id);
      const channel = state.items.find((c) => toStr(c.id) === strId);
      if (channel) channel.name = name;
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