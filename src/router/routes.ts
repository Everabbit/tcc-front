import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { path: 'register', component: () => import('pages/RegisterPage.vue') },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
    ],
  },
  {
    path: '/p',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: 'dashboard', component: () => import('pages/IndexPage.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
