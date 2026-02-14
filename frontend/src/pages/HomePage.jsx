import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { setChannels, setCurrentChannelId } from '../slices/channelsSlice.js';
import { setMessages } from '../slices/messagesSlice.js';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function HomePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const channels = useSelector((s) => s.channels.items);
  const currentChannelId = useSelector((s) => s.channels.currentChannelId);
  const messages = useSelector((s) => s.messages.items);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

        const curId = ch.length > 0 ? ch[0].id : null;

        dispatch(setChannels({ channels: ch, currentChannelId: curId }));
        dispatch(setMessages(msgs));
      } catch (e) {
        setLoadError('Не удалось загрузить данные. Попробуйте войти заново.');
        auth.logOut();
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [dispatch, navigate, auth]);

  const currentChannel = useMemo(
    () => channels.find((c) => String(c.id) === String(currentChannelId)),
    [channels, currentChannelId],
  );

  const visibleMessages = useMemo(
    () => messages.filter((m) => String(m.channelId) === String(currentChannelId)),
    [messages, currentChannelId],
  );

  const onLogout = () => {
    auth.logOut();
    navigate('/login', { replace: true });
  };

  if (loading) return <div style={{ padding: 24 }}>Загрузка…</div>;
  if (loadError) return <div style={{ padding: 24 }}>{loadError}</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 260, borderRight: '1px solid #ddd', padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <b>Каналы</b>
          <button type="button" onClick={onLogout}>Выйти</button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {channels.map((c) => (
            <li key={c.id} style={{ marginBottom: 6 }}>
              <button
                type="button"
                onClick={() => dispatch(setCurrentChannelId(c.id))}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  fontWeight: String(c.id) === String(currentChannelId) ? '700' : '400',
                }}
              >
                #{c.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid #ddd', paddingBottom: 8, marginBottom: 8 }}>
          <b>{currentChannel ? `#${currentChannel.name}` : 'Канал не выбран'}</b>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            сообщений: {visibleMessages.length}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {visibleMessages.map((m) => (
            <div key={m.id} style={{ marginBottom: 8 }}>
              <b>{m.username}</b>: {m.body}
            </div>
          ))}
        </div>

        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', gap: 8 }}>
          <input type="text" placeholder="Введите сообщение..." style={{ flex: 1 }} disabled />
          <button type="submit" disabled>Отправить</button>
        </form>
      </main>
    </div>
  );
}