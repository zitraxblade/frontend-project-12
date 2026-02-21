import { toast } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import {
  useEffect, useMemo, useRef, useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Button, Dropdown, ButtonGroup } from 'react-bootstrap'

import api from '../api.js'
import useAuth from '../auth/useAuth.js'
import { createSocket } from '../socket.js'
import { clean } from '../profanityFilter.js'

import {
  setChannels,
  setCurrentChannelId,
  addChannel,
  removeChannel,
  renameChannel,
} from '../store/slices/channelsSlice.js'

import {
  setMessages,
  addMessage,
  removeMessagesByChannel,
} from '../store/slices/messagesSlice.js'

import AddChannelModal from '../components/modals/AddChannelModal.jsx'
import RemoveChannelModal from '../components/modals/RemoveChannelModal.jsx'
import RenameChannelModal from '../components/modals/RenameChannelModal.jsx'

const DEFAULT_CHANNEL_ID = '1'

export default function HomePage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const dispatch = useDispatch()

  const socketRef = useRef(null)
  if (!socketRef.current) socketRef.current = createSocket()
  const socket = socketRef.current

  const channels = useSelector(s => s.channels.items)
  const currentChannelId = useSelector(s => s.channels.currentChannelId)
  const messages = useSelector(s => s.messages.items)

  const username = auth.username ?? 'unknown'

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(null)

  const [modal, setModal] = useState({ type: null, channel: null })
  const [modalSubmitting, setModalSubmitting] = useState(false)
  const [modalError, setModalError] = useState(null)

  const existingChannelNames = useMemo(
    () => channels.map(c => String(c.name ?? '').trim().toLowerCase()),
    [channels],
  )

  const currentChannel = useMemo(
    () => channels.find(c => String(c.id) === String(currentChannelId)),
    [channels, currentChannelId],
  )

  const visibleMessages = useMemo(
    () => messages.filter(m => String(m.channelId) === String(currentChannelId)),
    [messages, currentChannelId],
  )

  useEffect(() => {
    if (!auth.token) {
      setLoading(false)
      return
    }

    const load = async () => {
      setLoadError(null)
      setLoading(true)

      try {
        const [channelsRes, messagesRes] = await Promise.all([
          api.get('/channels'),
          api.get('/messages'),
        ])

        const ch = channelsRes.data ?? []
        const msgs = messagesRes.data ?? []
        const curId = ch.length > 0 ? String(ch[0].id) : DEFAULT_CHANNEL_ID

        dispatch(setChannels({ channels: ch, currentChannelId: curId }))
        dispatch(setMessages(msgs))
      }
      catch {
        setLoadError(t('chat.loadFailed'))
        toast.error(t('toasts.loadFailed'))
      }
      finally {
        setLoading(false)
      }
    }

    load()
  }, [auth.token, dispatch, t])

  useEffect(() => {
    if (!auth.token) return

    socket.auth = { token: auth.token }
    socket.connect()

    const onNewMessage = payload => dispatch(addMessage(payload))
    const onNewChannel = payload => dispatch(addChannel(payload))

    const onRemoveChannel = (payload) => {
      const removedId = String(payload.id)

      dispatch(removeChannel(removedId))
      dispatch(removeMessagesByChannel(removedId))

      if (String(currentChannelId) === removedId) {
        dispatch(setCurrentChannelId(DEFAULT_CHANNEL_ID))
      }
    }

    const onRenameChannel = payload => dispatch(renameChannel(payload))

    socket.on('newMessage', onNewMessage)
    socket.on('newChannel', onNewChannel)
    socket.on('removeChannel', onRemoveChannel)
    socket.on('renameChannel', onRenameChannel)

    return () => {
      socket.off('newMessage', onNewMessage)
      socket.off('newChannel', onNewChannel)
      socket.off('removeChannel', onRemoveChannel)
      socket.off('renameChannel', onRenameChannel)
      socket.disconnect()
    }
  }, [auth.token, socket, dispatch, currentChannelId])

  const openAdd = () => {
    setModalError(null)
    setModalSubmitting(false)
    setModal({ type: 'add', channel: null })
  }

  const openRemove = (channel) => {
    setModalError(null)
    setModalSubmitting(false)
    setModal({ type: 'remove', channel })
  }

  const openRename = (channel) => {
    setModalError(null)
    setModalSubmitting(false)
    setModal({ type: 'rename', channel })
  }

  const closeModal = () => setModal({ type: null, channel: null })

  const submitAdd = async (name) => {
    setModalSubmitting(true)
    setModalError(null)

    try {
      const safeName = clean(name)
      const res = await api.post('/channels', { name: safeName })

      dispatch(addChannel(res.data))
      dispatch(setCurrentChannelId(res.data.id))

      toast.success(t('toasts.channelCreated'))
      closeModal()
    }
    catch {
      setModalError(t('modals.createFailed'))
      toast.error(t('modals.createFailed'))
    }
    finally {
      setModalSubmitting(false)
    }
  }

  const submitRename = async (name) => {
    const ch = modal.channel
    if (!ch) return

    setModalSubmitting(true)
    setModalError(null)

    const safeName = clean(name)

    try {
      await api.patch(`/channels/${ch.id}`, { name: safeName })
      dispatch(renameChannel({ id: ch.id, name: safeName }))
      toast.success(t('toasts.channelRenamed'))
      closeModal()
    }
    catch {
      setModalError(t('modals.renameFailed'))
      toast.error(t('modals.renameFailed'))
    }
    finally {
      setModalSubmitting(false)
    }
  }

  const submitRemove = async () => {
    const ch = modal.channel
    if (!ch) return

    setModalSubmitting(true)
    setModalError(null)

    try {
      await api.delete(`/channels/${ch.id}`)

      const removedId = String(ch.id)
      dispatch(removeChannel(removedId))
      dispatch(removeMessagesByChannel(removedId))

      if (String(currentChannelId) === removedId) {
        dispatch(setCurrentChannelId(DEFAULT_CHANNEL_ID))
      }

      toast.success(t('toasts.channelRemoved'))
      closeModal()
    }
    catch {
      setModalError(t('modals.removeFailed'))
      toast.error(t('modals.removeFailed'))
    }
    finally {
      setModalSubmitting(false)
    }
  }

  const onSubmitMessage = async (e) => {
    e.preventDefault()

    const raw = text.trim()
    if (!raw || !currentChannelId) return

    const body = clean(raw)

    setSendError(null)
    setSending(true)

    try {
      const res = await api.post('/messages', {
        body,
        channelId: String(currentChannelId),
        username,
      })

      if (res?.data?.id != null) dispatch(addMessage(res.data))
      setText('')
    }
    catch {
      setSendError(t('chat.sendFailed'))
      toast.error(t('toasts.networkError'))
    }
    finally {
      setSending(false)
    }
  }

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />
  if (loading) return <div className="p-4">{t('common.loading')}</div>
  if (loadError) return <div className="p-4">{loadError}</div>

  return (
    <div className="d-flex flex-grow-1" style={{ height: '100vh', minHeight: 0 }}>
      <div className="border-end" style={{ width: 320, overflow: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2">
          <span className="fw-bold">{t('chat.channels')}</span>
          <Button
            type="button"
            size="sm"
            variant="outline-primary"
            onClick={openAdd}
            aria-label={t('modals.addChannelTitle')}
          >
            +
          </Button>
        </div>

        <div className="d-flex flex-column">
          {channels.map((c) => {
            const isActive = String(c.id) === String(currentChannelId)

            if (!c.removable) {
              return (
                <Button
                  key={c.id}
                  type="button"
                  variant={isActive ? 'secondary' : 'light'}
                  className="w-100 rounded-0 text-start text-truncate"
                  onClick={() => dispatch(setCurrentChannelId(c.id))}
                >
                  <span className="me-1">#</span>
                  {c.name}
                </Button>
              )
            }

            return (
              <Dropdown key={c.id} as={ButtonGroup} className="d-flex">
                <Button
                  type="button"
                  variant={isActive ? 'secondary' : 'light'}
                  className="w-100 rounded-0 text-start text-truncate"
                  onClick={() => dispatch(setCurrentChannelId(c.id))}
                >
                  <span className="me-1">#</span>
                  {c.name}
                </Button>

                <Dropdown.Toggle
                  variant={isActive ? 'secondary' : 'light'}
                  id={`channel-control-${c.id}`}
                  className="rounded-0"
                >
                  Управление каналом
                </Dropdown.Toggle>

                <Dropdown.Menu renderOnMount>
                  <Dropdown.Item as="button" type="button" onClick={() => openRemove(c)}>
                    Удалить
                  </Dropdown.Item>
                  <Dropdown.Item as="button" type="button" onClick={() => openRename(c)}>
                    Переименовать
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )
          })}
        </div>
      </div>

      <div className="flex-grow-1 d-flex flex-column px-4 py-3" style={{ minWidth: 0 }}>
        <div className="border-bottom pb-2 mb-3">
          <div className="fw-bold">
            {currentChannel ? `# ${currentChannel.name}` : t('chat.channelNotSelected')}
          </div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {t('chat.messagesCount', { count: visibleMessages.length })}
          </div>
        </div>

        <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
          {visibleMessages.map(m => (
            <div key={m.id} className="mb-2" style={{ wordBreak: 'break-word' }}>
              <b>{m.username}</b>
              {': '}
              {m.body}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmitMessage} className="d-flex gap-2 mt-3">
          <input
            type="text"
            aria-label={t('chat.newMessageLabel')}
            placeholder={t('chat.messagePlaceholder')}
            className="form-control"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" disabled={sending || text.trim().length === 0}>
            {sending ? t('common.sending') : t('common.send')}
          </Button>
        </form>

        {sendError && <div className="text-danger mt-2">{sendError}</div>}
      </div>

      <AddChannelModal
        show={modal.type === 'add'}
        onHide={closeModal}
        existingNames={existingChannelNames}
        onSubmit={submitAdd}
        submitting={modalSubmitting}
        submitError={modalError}
      />

      <RemoveChannelModal
        show={modal.type === 'remove'}
        onHide={closeModal}
        channelName={modal.channel?.name ?? ''}
        onConfirm={submitRemove}
        submitting={modalSubmitting}
        submitError={modalError}
      />

      <RenameChannelModal
        show={modal.type === 'rename'}
        onHide={closeModal}
        initialName={modal.channel?.name ?? ''}
        existingNames={existingChannelNames}
        onSubmit={submitRename}
        submitting={modalSubmitting}
        submitError={modalError}
      />
    </div>
  )
}
