import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  currentChannelId: '1',
}

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    // payload: { channels: [...], currentChannelId }
    setChannels(state, action) {
      const { channels = [], currentChannelId } = action.payload || {}
      state.items = channels
      if (currentChannelId != null) {
        state.currentChannelId = String(currentChannelId)
      } else if (channels[0]?.id != null) {
        state.currentChannelId = String(channels[0].id)
      }
    },

    // payload: id
    setCurrentChannelId(state, action) {
      state.currentChannelId = String(action.payload)
    },

    // payload: { id, name, removable? }
    addChannel(state, action) {
      const ch = action.payload
      if (!ch?.id) return

      const id = String(ch.id)
      const exists = state.items.some(c => String(c.id) === id)
      if (!exists) state.items.push(ch)
    },

    // payload: id
    removeChannel(state, action) {
      const id = String(action.payload)
      state.items = state.items.filter(c => String(c.id) !== id)

      if (String(state.currentChannelId) === id) {
        const fallback = state.items[0]?.id ?? '1'
        state.currentChannelId = String(fallback)
      }
    },

    // payload: { id, name }
    renameChannel(state, action) {
      const { id, name } = action.payload || {}
      if (id == null) return

      const target = state.items.find(c => String(c.id) === String(id))
      if (target && name != null) {
        target.name = name
      }
    },
  },
})

export const {
  setChannels,
  setCurrentChannelId,
  addChannel,
  removeChannel,
  renameChannel,
} = channelsSlice.actions

export default channelsSlice.reducer
