import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  currentChannelId: null,
};

const normalizeId = (v) => String(v);

const extractRename = (payload) => {
  if (!payload) return { id: null, name: null };

  // варианты, которые могут прийти:
  // 1) { id, name }
  if (payload.id != null && typeof payload.name === 'string') {
    return { id: payload.id, name: payload.name };
  }

  // 2) { id, changes: { name } }
  if (payload.id != null && payload.changes && typeof payload.changes.name === 'string') {
    return { id: payload.id, name: payload.changes.name };
  }

  // 3) { id, channel: { name } }
  if (payload.id != null && payload.channel && typeof payload.channel.name === 'string') {
    return { id: payload.id, name: payload.channel.name };
  }

  // 4) целый канал { id, ... } (например, с API/сокета)
  if (payload.id != null && typeof payload.name === 'string') {
    return { id: payload.id, name: payload.name };
  }

  return { id: null, name: null };
};

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setChannels(state, action) {
      const { channels, currentChannelId } = action.payload ?? {};
      state.items = Array.isArray(channels) ? channels : [];
      state.currentChannelId = currentChannelId != null ? normalizeId(currentChannelId) : null;
    },

    setCurrentChannelId(state, action) {
      state.currentChannelId = action.payload != null ? normalizeId(action.payload) : null;
    },

    addChannel(state, action) {
      const ch = action.payload;
      if (!ch || ch.id == null) return;

      const id = normalizeId(ch.id);
      const exists = state.items.some((c) => normalizeId(c.id) === id);
      if (!exists) state.items.push(ch);
    },

    removeChannel(state, action) {
      const id = normalizeId(action.payload);
      state.items = state.items.filter((c) => normalizeId(c.id) !== id);

      // если удалили текущий — оставим как есть, HomePage сам выставит дефолт
      if (state.currentChannelId != null && normalizeId(state.currentChannelId) === id) {
        state.currentChannelId = null;
      }
    },

    renameChannel(state, action) {
      const { id, name } = extractRename(action.payload);
      if (id == null || typeof name !== 'string') return;

      const sid = normalizeId(id);
      const ch = state.items.find((c) => normalizeId(c.id) === sid);
      if (!ch) return;

      ch.name = name;
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