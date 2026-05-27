import { get } from 'svelte/store';
import { authStore } from '../stores/auth.js';

let ws = null;
let reconnectTimeout = 3000;
let connected = false;

let storeRef = null;

export function setNotificationStore(store) {
  storeRef = store;
}

function getApiUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000';
}

export function connectWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  const token = get(authStore).token;
  if (!token) return;

  const apiUrl = getApiUrl();
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  const url = `${wsUrl}/ws/notifications?token=${encodeURIComponent(token)}`;

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('🔔 WebSocket connected');
    connected = true;
    reconnectTimeout = 3000;
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'notifications' && storeRef) {
      if (data.payload && Array.isArray(data.payload)) {
        storeRef.setItems(data.payload);
      } else if (typeof storeRef.fetch === 'function') {
        storeRef.fetch().catch(() => {});
      }
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('🔔 WebSocket disconnected, reconnecting...');
    connected = false;
    setTimeout(connectWebSocket, reconnectTimeout);
    reconnectTimeout = Math.min(reconnectTimeout * 2, 30000);
  };
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
    connected = false;
  }
}
