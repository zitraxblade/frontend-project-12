import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  currentChannelId: '1',
};

const normalizeId = (v) => String(v);

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setChannels(state, action) {
      const { channels, currentChannelId } = action.payload || {};
      state.items = Array.isArray(channels) ? channels : [];
      state.currentChannelId = currentChannelId != null ? normalizeId(currentChannelId) : '1';
    },

    setCurrentChannelId(state, action) {
      state.currentChannelId = normalizeId(action.payload);
    },

    addChannel(state, action) {
      state.items.push(action.payload);
    },

    removeChannel(state, action) {
      const id = normalizeId(action.payload);
      state.items = state.items.filter((c) => normalizeId(c.id) !== id);

      if (normalizeId(state.currentChannelId) === id) {
        const first = state.items[0];
        state.currentChannelId = first ? normalizeId(first.id) : '1';
      }
    },

    renameChannel(state, action) {
      // поддерживаем разные формы payload:
      // 1) { id, name } (мы так диспатчим)
      // 2) { id, name, ... } (так может приходить с сервера/сокета)
      const payload = action.payload || {};
      const id = normalizeId(payload.id);
      const name = payload.name;

      const ch = state.items.find((c) => normalizeId(c.id) === id);
      if (ch && typeof name === 'string') {
        ch.name = name;
      }
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