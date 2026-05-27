const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'planneredu_token';

async function req(method, path, body) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

const get  = (p)    => req('GET',    p);
const post = (p, b) => req('POST',   p, b);
const put  = (p, b) => req('PUT',    p, b);
const del  = (p)    => req('DELETE', p);

function q(params = {}) {
  const s = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return s ? `?${s}` : '';
}

export const api = {
  auth: {
    login:         (b) => post('/auth/login', b),
    register:      (b) => post('/auth/register', b),
    me:            ()  => get('/auth/me'),
    updateMe:      (b) => put('/auth/me', b),
    logout:        ()  => post('/auth/logout'),
    forgotPassword:(b) => post('/auth/forgot-password', b),
    resetPassword: (b) => post('/auth/reset-password', b),
    checkStreak:   ()  => post('/auth/streak/check'),
    getStreak:     ()  => get('/auth/streak'),
  },
  verify: {
    emailRequest: ()  => post('/verify/email-request'),
    emailConfirm: (b) => post('/verify/email-confirm', b),
  },
  institutions: {
    search: (q = '', type = '') => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (type) params.set('type', type);
      const qs = params.toString();
      return get(`/institutions${qs ? `?${qs}` : ''}`);
    },
    enroll:      (b)    => post('/institutions/enroll', b),
    create:      (b)    => post('/institutions', b),
    update:      (id,b) => put(`/institutions/${id}`, b),
    remove:      (id)   => del(`/institutions/${id}`),
    listUsers:   (id)   => get(`/institutions/${id}/users`),
    createUser:  (id,b) => post(`/institutions/${id}/users`, b),
  },
  classrooms: {
    list:   (institutionId)      => get(`/institutions/${institutionId}/classrooms`),
    create: (institutionId, b)   => post(`/institutions/${institutionId}/classrooms`, b),
    update: (institutionId, id, b) => put(`/institutions/${institutionId}/classrooms/${id}`, b),
    remove: (institutionId, id)  => del(`/institutions/${institutionId}/classrooms/${id}`),
  },
  enrollments: {
    list:    (p={}) => get('/enrollments' + q(p)),
    approve: (id)   => put(`/enrollments/${id}/approve`),
    reject:  (id)   => put(`/enrollments/${id}/reject`),
  },
  subjects: {
    list:   (p={}) => get('/subjects' + q(p)),
    create: (b)    => post('/subjects', b),
    update: (id,b) => put(`/subjects/${id}`, b),
    delete: (id)   => del(`/subjects/${id}`),
  },
  classSchedules: {
    list:   (p={}) => get('/class-schedules' + q(p)),
    create: (b)    => post('/class-schedules', b),
  },
  attendance: {
    list:   (p={}) => get('/attendance' + q(p)),
    create: (b)    => post('/attendance', b),
    update: (id,b) => put(`/attendance/${id}`, b),
  },
  grades: {
    list:   (p={}) => get('/grades' + q(p)),
    create: (b)    => post('/grades', b),
    update: (id,b) => put(`/grades/${id}`, b),
    delete: (id)   => del(`/grades/${id}`),
  },
  tasks: {
    list:   (p={})    => get('/tasks' + q(p)),
    get:    (id)      => get(`/tasks/${id}`),
    create: (b)       => post('/tasks', b),
    update: (id,b)    => put(`/tasks/${id}`, b),
    delete: (id)      => del(`/tasks/${id}`),
    quiz: {
      get:    (tid)   => get(`/tasks/${tid}/quiz`),
      submit: (tid,b) => post(`/tasks/${tid}/quiz/submit`, b),
    },
    history:  (id)    => get(`/tasks/${id}/history`),
    subtasks: {
      create: (tid,b)    => post(`/tasks/${tid}/subtasks`, b),
      update: (tid,id,b) => put(`/tasks/${tid}/subtasks/${id}`, b),
      delete: (tid,id)   => del(`/tasks/${tid}/subtasks/${id}`),
    },
  },
  teacher: {
    subjects:          ()       => get('/teacher/subjects'),
    subjectStudents:   (id)     => get(`/teacher/subjects/${id}/students`),
    allStudents:       ()       => get('/teacher/students'),
    studentTasks:      (sid)    => get(`/teacher/students/${sid}/tasks`),
    createStudentTask: (sid, b) => post(`/teacher/students/${sid}/tasks`, b),
    createSubjectTask: (id, b)  => post(`/teacher/subjects/${id}/tasks`, b),
    questions: {
      list:   (p={})  => get('/teacher/questions' + q(p)),
      create: (b)     => post('/teacher/questions', b),
    },
    attempts: {
      list:   (p={})  => get('/teacher/attempts' + q(p)),
      get:    (id)    => get(`/teacher/attempts/${id}`),
      grade:  (id,b)  => post(`/teacher/attempts/${id}/grade`, b),
    },
    calendar: {
      list:   ()     => get('/teacher/calendar'),
      create: (b)    => post('/teacher/calendar', b),
      delete: (id)   => del(`/teacher/calendar/${id}`),
    },
  },
  calendar: {
    list:   ()  => get('/calendar'),
    create: (b) => post('/calendar', b),
    delete: (id) => del(`/calendar/${id}`),
  },
  studyPlans: {
    list:   (p={})  => get('/study-plans' + q(p)),
    create: (b)     => post('/study-plans', b),
    update: (id,b)  => put(`/study-plans/${id}`, b),
    delete: (id)    => del(`/study-plans/${id}`),
  },
  achievements: {
    list: () => get('/achievements'),
    mine: () => get('/achievements/mine'),
  },
  xp: {
    summary: () => get('/xp'),
    add: (b) => post('/xp', b),
  },
  notifications: {
    list:       ()   => get('/notifications'),
    markRead:   (id) => put(`/notifications/${id}/read`),
    markAllRead:()   => put('/notifications/read-all'),
  },
  ranking: {
    list: () => get('/ranking'),
  },
  students: {
    stats:    () => get('/students/stats'),
    subjects: () => get('/students/subjects'),
  },
};
