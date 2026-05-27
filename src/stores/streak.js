import { writable } from 'svelte/store';
import { api } from '../lib/api.js';

export const streak = writable({ count: 0, justUpdated: false });

export async function checkStreak() {
  try {
    const data = await api.auth.checkStreak();
    streak.set({ count: data.streak_count, justUpdated: data.just_updated });
    return data;
  } catch (e) {
    console.error('Streak check failed:', e);
    return null;
  }
}

export async function fetchStreak() {
  try {
    const data = await api.auth.getStreak();
    streak.set({ count: data.streak_count, justUpdated: false });
    return data;
  } catch (e) {
    return null;
  }
}
