import { Navigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Button, Dropdown, ButtonGroup } from 'react-bootstrap';

import api from '../api.js';
import { useAuth } from '../auth/AuthProvider.jsx';
import { createSocket } from '../socket.js';

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
const isNetworkError = (e) => !e?.response; // axios: no response => offline / refused / etc.

export default function HomePage() {
  const { t } = useTranslation();
  const auth = useAuth();
  const dispatch = useDispatch();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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

  const socket = useMemo(() => createSocket(), []);

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

  // init: load channels + messages
  useEffect(() => {
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

        const curId = ch.length > 0 ? String(ch[0].id) : DEFAULT_CHANNEL_ID;

        dispatch(setChannels({ channels: ch, currentChannelId: curId }));
        dispatch(setMessages(msgs));
      } catch (e) {
        setLoadError(t('chat.loadFailed'));
        toast.error(t('toasts.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [dispatch, t]);

  // socket: messages + channels events
  useEffect(() => {
    if (!auth.isAuthenticated) return;

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
  }, [socket, dispatch, currentChannelId, auth.isAuthenticated]);

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

  const submitAdd = async (name) => {
    setModalError(null);
    setModalSubmitting(true);

    try {
      const res = await api.post('/channels', { name });
      const created = res.data;
      dispatch(setCurrentChannelId(created.id));
      toast.success(t('toasts.channelCreated'));
      closeModal();
    } catch (e) {
      setModalError(t('modals.createFailed'));
      toast.error(isNetworkError(e) ? t('toasts.networkError') : t('modals.createFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  const submitRename = async (name) => {
    const ch = modal.channel;
    if (!ch) return;

    setModalError(null);
    setModalSubmitting(true);

    try {
      await api.patch(`/channels/${ch.id}`, { name });
      toast.success(t('toasts.channelRenamed'));
      closeModal();
    } catch (e) {
      setModalError(t('modals.renameFailed'));
      toast.error(isNetworkError(e) ? t('toasts.networkError') : t('modals.renameFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  const submitRemove = async () => {
    const ch = modal.channel;
    if (!ch) return;

    setModalError(null);
    setModalSubmitting(true);

    try {
      await api.delete(`/channels/${ch.id}`);
      toast.success(t('toasts.channelRemoved'));
      closeModal();
    } catch (e) {
      setModalError(t('modals.removeFailed'));
      toast.error(isNetworkError(e) ? t('toasts.networkError') : t('modals.removeFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  const onSubmitMessage = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || !currentChannelId) return;

    setSendError(null);
    setSending(true);

    try {
      await api.post('/messages', {
        body,
        channelId: String(currentChannelId),
        username,
      });
      setText('');
      // сообщение придёт через socket
    } catch (err) {
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

      <main style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: 8, marginBottom: 8 }}>
          <b>
            {currentChannel ? `# ${currentChannel.name}` : t('chat.channelNotSelected')}
          </b>
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