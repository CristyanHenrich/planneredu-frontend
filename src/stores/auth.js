import { writable, derived } from 'svelte/store';
import { api } from '../lib/api.js';

const TOKEN_KEY = 'planneredu_token';
const USER_KEY  = 'planneredu_user';

function loadPersisted() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user  = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return { token: token || null, user };
  } catch {
    return { token: null, user: null };
  }
}

const { token: initToken, user: initUser } = loadPersisted();

const _store = writable({
  user:        initUser,
  token:       initToken,
  initialized: false,
  regData:     {},
});

function persist(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const authStore = {
  subscribe: _store.subscribe,

  async init() {
    const { token } = loadPersisted();
    if (token) {
      try {
        const user = await api.auth.me();
        persist(user, token);
        _store.update(s => ({ ...s, user, token, initialized: true }));
      } catch {
        clearStorage();
        _store.update(s => ({ ...s, user: null, token: null, initialized: true }));
      }
    } else {
      _store.update(s => ({ ...s, initialized: true }));
    }
  },

  async login(identifier, password, remember = false) {
    const data = await api.auth.login({ identifier, password, remember });
    if (data?.mfa_required) return data;
    persist(data.user, data.access_token);
    _store.update(s => ({ ...s, user: data.user, token: data.access_token }));
    return data;
  },

  async register(name, email, phone, password, passwordConfirmation, birthday) {
    const body = { name, email, password, password_confirmation: passwordConfirmation };
    if (phone) body.phone = phone;
    if (birthday) body.birthday = birthday;
    const data = await api.auth.register(body);
    persist(data.user, data.access_token);
    _store.update(s => ({ ...s, user: data.user, token: data.access_token }));
    return data;
  },

  async updateMe(updates) {
    const user = await api.auth.updateMe(updates);
    const { token } = loadPersisted();
    persist(user, token);
    _store.update(s => ({ ...s, user }));
    return user;
  },

  async logout() {
    try { await api.auth.logout(); } catch (_) {}
    clearStorage();
    _store.set({ user: null, token: null, initialized: true, regData: {} });
  },

  setRegData(data) {
    _store.update(s => ({ ...s, regData: { ...s.regData, ...data } }));
  },
};

// Stores derivados usados pelos componentes
export const currentUser     = derived(_store, s => s.user);
export const currentRole     = derived(_store, s => s.user?.role || 'student');
export const isAuthenticated = derived(_store, s => !!s.token);
export const isUniversity    = derived(_store, s => s.user?.study_mode === 'university');
export const studyMode       = derived(_store, s => s.user?.study_mode || 'school');

// Compat – usado pelo routes.js
export const ROLES = { STUDENT: 'student', TEACHER: 'teacher', COORDINATOR: 'coordinator', ADMIN: 'admin' };
