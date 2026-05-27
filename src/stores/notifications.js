import { writable, derived } from 'svelte/store';
import { api } from '../lib/api.js';
import { connectWebSocket, disconnectWebSocket, setNotificationStore } from '../lib/websocket.js';

function createNotificationStore() {
  const _store = writable({
    items: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  async function fetchNotifications() {
    try {
      const data = await api.notifications.list();
      const items = Array.isArray(data) ? data : (data?.notifications ?? data?.data ?? []);
      
      _store.update(s => ({
        ...s,
        items,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      _store.update(s => ({
        ...s,
        loading: false,
        error: err?.message || 'Falha ao carregar notificações',
      }));
    }
  }

  async function markAsRead(id) {
    try {
      await api.notifications.markRead(id);
      
      _store.update(s => ({
        ...s,
        items: s.items.map(n => n.id === id ? { ...n, read: true } : n),
      }));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  async function markAllAsRead() {
    try {
      await api.notifications.markAllRead();
      
      _store.update(s => ({
        ...s,
        items: s.items.map(n => ({ ...n, read: true })),
      }));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }

  function setItems(items) {
    _store.update(s => ({
      ...s,
      items,
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    }));
  }

  function startPolling() {
    fetchNotifications();
    connectWebSocket();
  }

  function stopPolling() {
    disconnectWebSocket();
  }

  const store = {
    subscribe: _store.subscribe,
    fetch: fetchNotifications,
    setItems,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  };

  setNotificationStore(store);

  return store;
}

export const notificationStore = createNotificationStore();

export const unreadCount = derived(notificationStore, $s => 
  $s.items.filter(n => !n.read).length
);

export const recentNotifications = derived(notificationStore, $s => 
  $s.items.slice(0, 5)
);
