import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
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

  // socket стабилен между рендерами
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
    () => channels.map((c) => String(c.name ?? '').trim().toLowerCase()),
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

  // INIT: загрузка каналов/сообщений
  useEffect(() => {
    if (!auth.token) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoadError(null);
      setLoading(true);

      try {
        const [channelsRes, messagesRes] = await Promise.all([
          api.get('/channels'),
          api.get('/messages'),
        ]);

        const ch = channelsRes.data ?? [];
        const msgs = messagesRes.data ?? [];

        const curId = ch.length > 0 ? String(ch[0].id) : DEFAULT_CHANNEL_ID;

        dispatch(setChannels({ channels: ch, currentChannelId: curId }));
        dispatch(setMessages(msgs));
      } catch {
        setLoadError(t('chat.loadFailed'));
        toast.error(t('toasts.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [auth.token, dispatch, t]);

  // SOCKET: слушаем события
  useEffect(() => {
    if (!auth.token) return;

    socket.auth = { token: auth.token };
    socket.connect();

    const onNewMessage = (payload) => dispatch(addMessage(payload));
    const onNewChannel = (payload) => dispatch(addChannel(payload));

    const onRemoveChannel = (payload) => {
      const removedId = String(payload?.id);

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

  // CREATE CHANNEL
  const submitAdd = async (name) => {
    setModalSubmitting(true);
    setModalError(null);

    try {
      const safeName = clean(name);
      const res = await api.post('/channels', { name: safeName });

      // тестам важно, чтобы UI обновился сразу
      dispatch(addChannel(res.data));
      dispatch(setCurrentChannelId(res.data.id));

      toast.success(t('toasts.channelCreated'));
      closeModal();
    } catch {
      setModalError(t('modals.createFailed'));
      toast.error(t('modals.createFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  // RENAME CHANNEL
  const submitRename = async (name) => {
    const ch = modal.channel;
    if (!ch) return;

    setModalSubmitting(true);
    setModalError(null);

    const safeName = clean(name);

    try {
      await api.patch(`/channels/${ch.id}`, { name: safeName });

      // важно: обновить сразу, не ждать сокет
      dispatch(renameChannel({ id: ch.id, name: safeName }));

      toast.success(t('toasts.channelRenamed'));
      closeModal();
    } catch {
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

      // тоже обновляем сразу
      dispatch(removeChannel(String(ch.id)));
      dispatch(removeMessagesByChannel(String(ch.id)));
      if (String(currentChannelId) === String(ch.id)) {
        dispatch(setCurrentChannelId(DEFAULT_CHANNEL_ID));
      }

      toast.success(t('toasts.channelRemoved'));
      closeModal();
    } catch {
      setModalError(t('modals.removeFailed'));
      toast.error(t('modals.removeFailed'));
    } finally {
      setModalSubmitting(false);
    }
  };

  // SEND MESSAGE
  const onSubmitMessage = async (e) => {
    e.preventDefault();

    const raw = text.trim();
    if (!raw || !currentChannelId) return;

    const body = clean(raw);

    setSendError(null);
    setSending(true);

    try {
      const res = await api.post('/messages', {
        body,
        channelId: String(currentChannelId),
        username,
      });

      if (res?.data?.id != null) dispatch(addMessage(res.data));
      setText('');
    } catch {
      setSendError(t('chat.sendFailed'));
      toast.error(t('toasts.networkError'));
    } finally {
      setSending(false);
    }
  };

  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  if (loading) return <div className="p-4">{t('common.loading')}</div>;
  if (loadError) return <div className="p-4">{loadError}</div>;

  return (
    <div className="h-100">
      <div className="container-fluid h-100 my-4 overflow-hidden rounded shadow">
        <div className="row h-100 flex-md-row bg-white">
          {/* SIDEBAR */}
          <div className="col-4 col-md-2 border-end px-0 bg-light flex-column h-100 d-flex">
            <div className="d-flex mt-1 justify-content-between mb-2 ps-4 pe-2 p-4">
              <b>{t('chat.channels')}</b>
              <Button
                variant="outline-primary"
                className="p-0 text-primary btn-group-vertical"
                onClick={openAdd}
                aria-label={t('modals.addChannelTitle')}
              >
                <span className="visually-hidden">+</span>
                +
              </Button>
            </div>

            <ul className="nav flex-column nav-pills nav-fill px-2 mb-3 overflow-auto h-100 d-block">
              {channels.map((c) => {
                const isActive = String(c.id) === String(currentChannelId);

                if (!c.removable) {
                  return (
                    <li className="nav-item w-100" key={c.id}>
                      <Button
                        type="button"
                        variant={isActive ? 'secondary' : 'light'}
                        className="w-100 rounded-0 text-start text-truncate"
                        onClick={() => dispatch(setCurrentChannelId(c.id))}
                      >
                        <span className="me-1">#</span>
                        {c.name}
                      </Button>
                    </li>
                  );
                }

                return (
                  <li className="nav-item w-100" key={c.id}>
                    <Dropdown as={ButtonGroup} className="d-flex">
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
                        split
                        variant={isActive ? 'secondary' : 'light'}
                        id={`channel-control-${c.id}`}
                        aria-label={t('chat.channelManagement')}
                      />

                      {/* важно: пусть пункты будут в DOM сразу */}
                      <Dropdown.Menu renderOnMount>
                        <Dropdown.Item as="button" type="button" onClick={() => openRename(c)}>
                          {t('modals.renameChannelTitle')}
                        </Dropdown.Item>
                        <Dropdown.Item as="button" type="button" onClick={() => openRemove(c)}>
                          {t('modals.removeChannelTitle')}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* MAIN */}
          <div className="col p-0 h-100">
            <div className="d-flex flex-column h-100">
              <div className="bg-light mb-4 p-3 shadow-sm small">
                <p className="m-0">
                  <b>{currentChannel ? `# ${currentChannel.name}` : t('chat.channelNotSelected')}</b>
                </p>
                <span className="text-muted">
                  {t('chat.messagesCount', { count: visibleMessages.length })}
                </span>
              </div>

              <div className="chat-messages overflow-auto px-5">
                {visibleMessages.map((m) => (
                  <div className="text-break mb-2" key={m.id}>
                    <b>{m.username}</b>
                    {': '}
                    {m.body}
                  </div>
                ))}
              </div>

              <div className="mt-auto px-5 py-3">
                <form className="py-1 border rounded-2" noValidate onSubmit={onSubmitMessage}>
                  <div className="input-group has-validation">
                    <input
                      name="body"
                      type="text"
                      aria-label={t('chat.newMessageLabel')}
                      placeholder={t('chat.messagePlaceholder')}
                      className="border-0 p-0 ps-2 form-control"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={sending}
                    />
                    <Button type="submit" variant="group-vertical" disabled={sending || text.trim().length === 0}>
                      {sending ? t('common.sending') : t('common.send')}
                    </Button>
                  </div>
                </form>

                {sendError && <div className="text-danger mt-2">{sendError}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
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