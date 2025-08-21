import { RolesEnum } from 'src/enums/roles.enum';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { requiresAuth: false, checkPermission: false },
    children: [
      {
        path: 'registro',
        name: 'register',
        component: () => import('pages/auth/RegisterEmailPage.vue'),
      },
      {
        path: 'confirmarregistro/:token',
        name: 'confirmregister',
        props: true,
        component: () => import('pages/auth/RegisterPage.vue'),
      },
      {
        path: '',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
      },
      {
        path: 'recuperarsenha',
        name: 'recoverPassword',
        component: () => import('pages/auth/ForgotPasswordPage.vue'),
      },
      {
        path: 'redefinirsenha/:token',
        name: 'resetPassword',
        props: true,
        component: () => import('pages/auth/ChangePasswordPage.vue'),
      },
      {
        path: 'confirmaremail/:token',
        name: 'confirmEmail',
        props: true,
        component: () => import('pages/auth/ConfirmEmailPage.vue'),
      },
    ],
  },
  {
    path: '/p',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/IndexPage.vue'),
        name: 'Dashboard',
        meta: { checkPermission: false },
      },
      {
        path: 'projetos',
        component: () => import('pages/ProjectsPage.vue'),
        name: 'Projetos',
        meta: {
          checkPermission: false,
          button: true,
          label: 'Novo Projeto',
          icon: 'mdi-plus',
          emitt: 'open-project-dialog',
        },
      },
      {
        path: 'projetos/:projectId',
        component: () => import('pages/ProjectPage.vue'),
        name: 'Projeto',
        props: true,
        meta: {
          checkPermission: true,
        },
      },
      {
        path: 'projetos/versoes/:projectId',
        component: () => import('pages/VersionsPage.vue'),
        name: 'Versões',
        props: true,
        meta: {
          checkPermission: true,
          button: true,
          buttonPermission: RolesEnum.MANAGER,
          label: 'Nova Versão',
          icon: 'mdi-plus',
          emitt: 'open-version-dialog',
        },
      },
      {
        path: 'projetos/versoes/tarefas/:projectId/:versionId',
        component: () => import('pages/TasksPage.vue'),
        name: 'Tarefas',
        props: true,
        meta: {
          checkPermission: true,
          button: true,
          buttonPermission: RolesEnum.DEVELOPER,
          label: 'Nova Tarefa',
          icon: 'mdi-plus',
          emitt: 'open-task-dialog',
        },
      },
      {
        path: 'minhas_tarefas',
        component: () => import('pages/MyTasksPage.vue'),
        name: 'Minhas Tarefas',
        meta: {
          checkPermission: false,
          button: true,
          buttonPermission: RolesEnum.DEVELOPER,
          label: 'Nova Tarefa',
          icon: 'mdi-plus',
          emitt: 'open-task-dialog',
        },
      },
      {
        path: 'configuracoes',
        component: () => import('pages/SettingsPage.vue'),
        name: 'Configurações',
        meta: {
          checkPermission: false,
        },
      },
      {
        path: 'notificacoes',
        component: () => import('pages/NotificationsPage.vue'),
        name: 'Notificações',
        meta: {
          checkPermission: false,
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
