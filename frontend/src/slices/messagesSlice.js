import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action) {
      state.items = action.payload;
    },
    addMessage(state, action) {
      state.items.push(action.payload);
    },
    removeMessagesByChannel(state, action) {
      const channelId = String(action.payload);
      state.items = state.items.filter((m) => String(m.channelId) !== channelId);
    },
  },
});

export const { setMessages, addMessage, removeMessagesByChannel } = messagesSlice.actions;
export default messagesSlice.reducer;