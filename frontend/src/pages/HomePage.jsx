import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, ButtonGroup } from 'react-bootstrap';

import api from '../api.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { createSocket } from '../socket.js';
import { clean } from '../profanityFilter.js';

import {
  setChannels,
  setCurrentChannelId,
  addChannel,
  removeChannel,
  renameChannel,
} from '../slices/channelsSlice.js';

import {
  setMessages,
  addMessage,
  removeMessagesByChannel,
} from '../slices/messagesSlice.js';

import AddChannelModal from '../components/modals/AddChannelModal.jsx';
import RemoveChannelModal from '../components/modals/RemoveChannelModal.jsx';
import RenameChannelModal from '../components/modals/RenameChannelModal.jsx';

const DEFAULT_CHANNEL_ID = '1';

export default function HomePage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const dispatch = useDispatch();

  // ✅ сокет живёт стабильно
  const socketRef = useRef(null);
  if (!socketRef.current) socketRef.current = createSocket();
  const socket = socketRef.current;

  const channels = useSelector((s) => s.channels.items);
  const currentChannelId = useSelector((s) => s.channels.currentChannelId);
  const messages = useSelector((s) => s.messages.items);

  const username = auth.username ?? 'unknown';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);

  const [modal, setModal] = useState({ type: null, channel: null });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const existingChannelNames = useMemo(
    () => channels.map((c) => c.name.trim().toLowerCase()),
    [channels],
  );

  const currentChannel = useMemo(
    () => channels.find((c) => String(c.id) === String(currentChannelId)),
    [channels, currentChannelId],
  );

  const visibleMessages = useMemo(
    () => messages.filter((m) => String(m.channelId) === String(currentChannelId)),
    [messages, currentChannelId],
  );

  // ✅ редирект только если реально не авторизован
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ INIT: грузим данные, но currentChannelId ставим только если он ещё не выбран
  useEffect(() => {
    if (!auth.token) return;

    const load = async () => {
      setLoadError(null);
      setLoading(true);

      try {
        const [channelsRes, messagesRes] = await Promise.all([
          api.get('/channels'),
          api.get('/messages'),
        ]);

        const ch = channelsRes.data;
        const msgs = messagesRes.data;

        dispatch(setChannels({
          channels: ch,
          currentChannelId: currentChannelId ?? (ch.length > 0 ? String(ch[0].id) : DEFAULT_CHANNEL_ID),
        }));

        dispatch(setMessages(msgs));
      } catch (e) {
        setLoadError(t('chat.loadFailed'));
        toast.error(t('toasts.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    load();
    // ВАЖНО: currentChannelId в deps, чтобы не перетирать его, когда он уже есть
  }, [auth.token, dispatch, t, currentChannelId]);

  // ✅ SOCKET: самый важный фикс — всегда disconnect -> auth -> connect
  useEffect(() => {
    if (!auth.token) return;

    // гарантируем чистое подключение с актуальным токеном
    socket.disconnect();
    socket.auth = { token: auth.token };
    socket.connect();

    const onNewMessage = (payload) => dispatch(addMessage(payload));
    const onNewChannel = (payload) => dispatch(addChannel(payload));

    const onRemoveChannel = (payload) => {
      const removedId = String(payload.id);

      dispatch(removeChannel(removedId));
      dispatch(removeMessagesByChannel(removedId));

      if (String(currentChannelId) === removedId) {
        dispatch(setCurrentChannelId(DEFAULT_CHANNEL_ID));
      }
    };

    const onRenameChannel = (payload) => dispatch(renameChannel(payload));

    socket.on('newMessage', onNewMessage);
    socket.on('newChannel', onNewChannel);
    socket.on('removeChannel', onRemoveChannel);
    socket.on('renameChannel', onRenameChannel);

    return () => {
      socket.off('newMessage', onNewMessage);
      socket.off('newChannel', onNewChannel);
      socket.off('removeChannel', onRemoveChannel);
      socket.off('renameChannel', onRenameChannel);
      socket.disconnect();
    };
  }, [auth.token, socket, dispatch, currentChannelId]);

  const openAdd = () => {
    setModalError(null);
    setModalSubmitting(false);
    setModal({ type: 'add', channel: null });
  };

  const openRemove = (channel) => {
    setModalError(null);
    setModalSubmitting(false);
    setModal({ type: 'remove', channel });
  };

  const openRename = (channel) => {
    setModalError(null);
    setModalSubmitting(false);
    setModal({ type: 'rename', channel });
  };

  const closeModal = () => setModal({ type: null, channel: null });

  // CREATE CHANNEL (фильтр)
  const submitAdd = async (name) => {
    setModalSubmitting(true);
    setModalError(null);

    try {
      const safeName = clean(name);
      const res = await api.post('/channels', { name: safeName });

      dispatch(setCurrentChannelId(res.data.id));
      toast.success(t('toasts.channelCreated'));
      closeModal();
    } catch (e) {
      setModalError(t('modals.createFailed'));
      toast.error(t('modals.createFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  // RENAME CHANNEL (фильтр)
  const submitRename = async (name) => {
    const ch = modal.channel;
    if (!ch) return;

    setModalSubmitting(true);
    setModalError(null);

    try {
      const safeName = clean(name);
      await api.patch(`/channels/${ch.id}`, { name: safeName });

      toast.success(t('toasts.channelRenamed'));
      closeModal();
    } catch (e) {
      setModalError(t('modals.renameFailed'));
      toast.error(t('modals.renameFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  // REMOVE CHANNEL
  const submitRemove = async () => {
    const ch = modal.channel;
    if (!ch) return;

    setModalSubmitting(true);
    setModalError(null);

    try {
      await api.delete(`/channels/${ch.id}`);

      toast.success(t('toasts.channelRemoved'));
      closeModal();
    } catch (e) {
      setModalError(t('modals.removeFailed'));
      toast.error(t('modals.removeFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  // SEND MESSAGE (фильтр)
  const onSubmitMessage = async (e) => {
    e.preventDefault();
    const raw = text.trim();
    if (!raw || !currentChannelId) return;

    const body = clean(raw);

    setSendError(null);
    setSending(true);

    try {
      await api.post('/messages', {
        body,
        channelId: String(currentChannelId),
        username,
      });
      setText('');
    } catch (e2) {
      setSendError(t('chat.sendFailed'));
      toast.error(t('toasts.networkError'));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div style={{ padding: 24 }}>{t('common.loading')}</div>;
  if (loadError) return <div style={{ padding: 24 }}>{loadError}</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* LEFT */}
      <aside style={{ width: 320, borderRight: '1px solid #ddd', padding: 12, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <b>{t('chat.channels')}</b>
          <Button size="sm" variant="outline-primary" onClick={openAdd}>
            +
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {channels.map((c) => {
            const isActive = String(c.id) === String(currentChannelId);

            if (!c.removable) {
              return (
                <Button
                  key={c.id}
                  variant={isActive ? 'primary' : 'light'}
                  onClick={() => dispatch(setCurrentChannelId(c.id))}
                  style={{
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  # {c.name}
                </Button>
              );
            }

            return (
              <Dropdown as={ButtonGroup} key={c.id}>
                <Button
                  variant={isActive ? 'primary' : 'light'}
                  onClick={() => dispatch(setCurrentChannelId(c.id))}
                  style={{
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  # {c.name}
                </Button>

                <Dropdown.Toggle split variant={isActive ? 'primary' : 'light'} id={`ch-${c.id}`} />

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => openRename(c)}>
                    {t('modals.renameChannelTitle')}
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => openRemove(c)}>
                    {t('common.delete')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            );
          })}
        </div>
      </aside>

      {/* RIGHT */}
      <main style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: 8, marginBottom: 8 }}>
          <b>{currentChannel ? `# ${currentChannel.name}` : t('chat.channelNotSelected')}</b>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {t('chat.messagesCount', { count: visibleMessages.length })}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {visibleMessages.map((m) => (
            <div key={m.id} style={{ marginBottom: 8, wordBreak: 'break-word' }}>
              <b>{m.username}</b>: {m.body}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmitMessage} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder={t('chat.messagePlaceholder')}
            style={{ flex: 1 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending}
          />
          <button type="submit" disabled={sending || text.trim().length === 0}>
            {sending ? t('common.sending') : t('common.send')}
          </button>
        </form>

        {sendError && <div style={{ marginTop: 8, color: 'salmon' }}>{sendError}</div>}
      </main>

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
  );
}