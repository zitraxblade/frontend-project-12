import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action) {
      state.items = action.payload
    },
    addMessage(state, action) {
      const msg = action.payload
      const exists = state.items.some(m => String(m.id) === String(msg.id))
      if (!exists) state.items.push(msg)
    },
    removeMessagesByChannel(state, action) {
      const channelId = String(action.payload)
      state.items = state.items.filter(m => String(m.channelId) !== channelId)
    },
  },
})

export const { setMessages, addMessage, removeMessagesByChannel } = messagesSlice.actions
export default messagesSlice.reducer
