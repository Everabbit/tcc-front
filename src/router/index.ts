import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useAuthStore } from 'src/stores/authStore';
import { useSettingsStore } from 'src/stores/settingsStore';
import { fromBase64 } from 'src/utils/transform';
import { useRolesStore } from 'src/stores/rolesStore';
import { RolesEnum } from 'src/enums/roles.enum';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const settingsStore = useSettingsStore();

    await authStore.tryAutoLogin();

    const isAuthenticated = authStore.isAuthenticated;
    const requiresAuth = to.meta.requiresAuth;
    const checkPermission = to.meta.checkPermission;
    const rolesStore = useRolesStore();

    if (checkPermission) {
      if (!to.params.projectId) {
        next({ name: 'Dashboard' });
      }
      const projectId = fromBase64(to.params.projectId as string);
      if (projectId) {
        await rolesStore.fetchAndSetRole(Number(projectId));
        if (!rolesStore.hasPermission(RolesEnum.VIEWER)) {
          next({ name: 'Dashboard' });
        }
      }
    } else {
      rolesStore.resetRole();
    }

    if (requiresAuth && isAuthenticated) {
      await settingsStore.fetchAndApplySettings();
      next();
    } else if (requiresAuth && !isAuthenticated) {
      next({ name: 'login' });
    } else if (
      !requiresAuth &&
      isAuthenticated &&
      (to.name === 'login' || to.name === 'register')
    ) {
      next({ name: 'Dashboard' });
    } else {
      next();
    }
  });

  return Router;
});
