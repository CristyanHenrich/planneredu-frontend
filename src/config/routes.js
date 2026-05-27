export const ROLE_META = {
  student:     { label: 'Aluno',       color: '#004E98', bg: 'rgba(0,78,152,0.1)'   },
  teacher:     { label: 'Professor',   color: '#FF6700', bg: 'rgba(255,103,0,0.1)'  },
  coordinator: { label: 'Coordenador', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  admin:       { label: 'Admin',       color: '#FF2D5F', bg: 'rgba(255,45,95,0.1)'  },
};

export const routeGroups = [
  {
    id: 'global',
    label: 'Global',
    roles: ['*'],
    items: [
      { id: 'welcome',    label: 'Login',               icon: 'lock',   path: '/login',       layout: 'auth', loader: () => import('../pages/global/LoginPage.svelte')    },
      { id: 'login',     label: 'Login',               icon: 'lock',   path: '/login',       layout: 'auth', loader: () => import('../pages/global/LoginPage.svelte')    },
      { id: 'signup',    label: 'Criar conta',         icon: 'user',   path: '/register',    layout: 'auth', loader: () => import('../pages/global/RegisterPage.svelte') },
      { id: 'otp',       label: 'Verificar e-mail',    icon: 'mail',   path: '/verify',      layout: 'auth', loader: () => import('../pages/global/OTPPage.svelte')      },
      { id: 'study-mode',label: 'Perfil de estudante', icon: 'book',   path: '/study-mode',  layout: 'auth', loader: () => import('../pages/global/StudyModePage.svelte') },
      { id: 'school',    label: 'Info da instituição',  icon: 'school', path: '/school',      layout: 'auth', loader: () => import('../pages/global/SchoolInfoPage.svelte') },
      { id: 'success',   label: 'Cadastro OK',         icon: 'check',  path: '/welcome',     layout: 'auth', loader: () => import('../pages/global/SuccessPage.svelte')  },
    ],
  },
  {
    id: 'student',
    label: 'Aluno',
    roles: ['student'],
    items: [
      { id: 'home',          label: 'Dashboard',    icon: 'home',     path: '/s/home',         layout: 'app', loader: () => import('../pages/student/Dashboard.svelte')           },
      { id: 'notifications', label: 'Notificações', icon: 'bell',     path: '/s/notification',    layout: 'app', loader: () => import('../pages/student/NotificationsPage.svelte')   },
      { id: 'calendar',      label: 'Calendário',   icon: 'calendar', path: '/s/calendar',     layout: 'app', loader: () => import('../pages/student/CalendarPage.svelte')        },
      { id: 'subjects',      label: 'Matérias',     icon: 'book',     path: '/s/subjects',     layout: 'app', loader: () => import('../pages/student/SubjectsPage.svelte')        },
      { id: 'kanban',        label: 'Kanban',       icon: 'chart',    path: '/s/kanban',       layout: 'app', loader: () => import('../pages/student/KanbanPage.svelte')          },
      { id: 'study-plan',    label: 'Cronograma',   icon: 'clock',    path: '/s/study',        layout: 'app', loader: () => import('../pages/student/StudyPlanPage.svelte')       },
      { id: 'analytics',     label: 'Desempenho',   icon: 'chart',    path: '/s/analytics',    layout: 'app', loader: () => import('../pages/student/AnalyticsPage.svelte')       },
      { id: 'ai',            label: 'Edu IA',       icon: 'star',     path: '/s/ai',           layout: 'app', loader: () => import('../pages/student/AIPage.svelte')              },
      { id: 'ranking',       label: 'Ranking',      icon: 'star',     path: '/s/ranking',      layout: 'app', loader: () => import('../pages/student/RankingPage.svelte')         },
      { id: 'achievements',  label: 'Conquistas',   icon: 'check',    path: '/s/achievements', layout: 'app', loader: () => import('../pages/student/AchievementsPage.svelte')    },
      { id: 'student-quiz',  label: 'Realizar Avaliação', icon: 'check', path: '/s/quiz',       layout: 'app', loader: () => import('../pages/student/QuizPage.svelte'), sidebarHidden: true },
    ],
  },
  {
    id: 'teacher',
    label: 'Professor',
    roles: ['teacher'],
    items: [
      { id: 't-dashboard',       label: 'Dashboard',  icon: 'home',     path: '/t/dashboard',   layout: 'app', loader: () => import('../pages/teacher/Dashboard.svelte') },
      { id: 'teacher-classes',   label: 'Turmas',     icon: 'book',     path: '/t/classes',     layout: 'app', loader: () => import('../pages/teacher/ClassesPage.svelte') },
      { id: 'teacher-students',  label: 'Alunos',     icon: 'user',     path: '/t/students',    layout: 'app', loader: () => import('../pages/teacher/StudentsPage.svelte') },
      { id: 'teacher-questions', label: 'Questões',   icon: 'star',     path: '/t/questions',   layout: 'app', loader: () => import('../pages/teacher/QuestionsPage.svelte') },
      { id: 'teacher-corrections', label: 'Correções', icon: 'check',  path: '/t/corrections', layout: 'app', loader: () => import('../pages/teacher/CorrectionsPage.svelte') },
      { id: 'teacher-student',   label: 'Progresso',  icon: 'user',     path: '/t/student',     layout: 'app', loader: () => import('../pages/teacher/StudentProgressPage.svelte'), sidebarHidden: true },
      { id: 'teacher-correction', label: 'Corrigir Tarefa', icon: 'check', path: '/t/correction', layout: 'app', loader: () => import('../pages/teacher/CorrectionPage.svelte'), sidebarHidden: true },
    ],
  },
  {
    id: 'coordinator',
    label: 'Coordenador',
    roles: ['coordinator'],
    items: [
      { id: 'c-dashboard',   label: 'Dashboard',   icon: 'home',   path: '/c/dashboard',   layout: 'app', loader: () => import('../pages/coordinator/Dashboard.svelte')      },
      { id: 'c-enrollments', label: 'Matrículas',  icon: 'check',  path: '/c/enrollments', layout: 'app', loader: () => import('../pages/coordinator/EnrollmentsPage.svelte') },
      { id: 'c-classrooms',  label: 'Turmas',      icon: 'school', path: '/c/classrooms',  layout: 'app', loader: () => import('../pages/coordinator/ClassRoomsPage.svelte')  },
      { id: 'c-students',    label: 'Alunos',      icon: 'user',   path: '/c/students',    layout: 'app', loader: () => import('../pages/coordinator/StudentsPage.svelte'), sidebarHidden: true },
      { id: 'c-teachers',    label: 'Professores', icon: 'user',   path: '/c/teachers',    layout: 'app', loader: () => import('../pages/coordinator/TeachersPage.svelte')    },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    roles: ['admin'],
    items: [
      { id: 'a-dashboard',    label: 'Dashboard',    icon: 'home',   path: '/a/dashboard',    layout: 'app', loader: () => import('../pages/admin/Dashboard.svelte')             },
      { id: 'a-institutions', label: 'Instituições', icon: 'school', path: '/a/institutions', layout: 'app', loader: () => import('../pages/admin/InstitutionsPage.svelte')      },
      { id: 'a-inst-users',   label: 'Usuários',     icon: 'user',   path: '/a/inst-users',   layout: 'app', loader: () => import('../pages/admin/InstitutionUsersPage.svelte'), sidebarHidden: true },
    ],
  },
];

export function getRoutesForRole(role) {
  return routeGroups
    .filter(g => g.roles.includes('*') || g.roles.includes(role))
    .map(g => ({ ...g, items: g.items ?? [] }));
}

export function findRoute(id) {
  for (const g of routeGroups) {
    const item = (g.items ?? []).find(r => r.id === id);
    if (item) return item;
  }
  return null;
}
