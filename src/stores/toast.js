import { writable } from 'svelte/store';

export const toasts = writable([]);

let id = 0;

export function showToast(message, type = 'warning', duration = 4000) {
  const toastId = ++id;
  toasts.update(t => [...t, { id: toastId, message, type }]);
  setTimeout(() => {
    toasts.update(t => t.filter(toast => toast.id !== toastId));
  }, duration);
}
