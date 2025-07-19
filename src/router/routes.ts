import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'registro', component: () => import('pages/RegisterPage.vue') },
      { path: '', component: () => import('pages/LoginPage.vue') },
    ],
  },
  {
    path: '/p',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'dashboard', component: () => import('pages/IndexPage.vue'), name: 'Dashboard' },
      {
        path: 'projetos',
        component: () => import('pages/ProjectsPage.vue'),
        name: 'Projetos',
        meta: {
          button: true,
          label: 'Novo Projeto',
          icon: 'mdi-plus',
          emitt: 'open-project-dialog',
        },
      },
      {
        path: 'projetos/:id',
        component: () => import('pages/ProjectPage.vue'),
        name: 'Projeto',
        props: true,
      },
      {
        path: 'projetos/versoes/:id',
        component: () => import('pages/VersionsPage.vue'),
        name: 'Versões',
        props: true,
        meta: {
          button: true,
          label: 'Nova Versão',
          icon: 'mdi-plus',
          emitt: 'open-version-dialog',
        },
      },
      {
        path: 'projetos/versoes/tarefas/:id',
        component: () => import('pages/TasksPage.vue'),
        name: 'Tarefas',
        props: true,
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
