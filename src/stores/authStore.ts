import { defineStore } from 'pinia';
import { Dark, Notify, useQuasar } from 'quasar';
import { UserBasicI } from 'src/models/user.model';
import api from 'src/services/api';
import UserService from 'src/services/user.service';
import { getUsernameInitials } from 'src/utils/utils';
import { useSettingsStore } from './settingsStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserBasicI | null,
    token: localStorage.getItem('user-token') || null,
    status: 'pending' as 'pending' | 'loading' | 'success' | 'error',
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    username: (state) => state.user?.username || 'Visitante',
    userInitial: (state) => state.user?.username?.charAt(0).toUpperCase() || '?',
    isLoadingUser: (state) => state.status === 'loading',
    getUser: (state) => state.user,
  },

  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('user-token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    async fetchUser() {
      if (!this.token) return;
      this.status = 'loading';
      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

      try {
        const response = await UserService.getBasicUser();
        if (response.success) {
          this.user = response.data;
          this.status = 'success';
        } else {
          throw new Error(response.message || 'Falha ao buscar dados do usuário.');
        }
      } catch (error: any) {
        this.status = 'error';
        Notify.create({
          type: 'negative',
          message: 'Sessão inválida. Por favor, faça login novamente.',
        });
        this.logout();
      }
    },

    async tryAutoLogin(): Promise<boolean> {
      if (this.user) {
        return true;
      }

      if (!this.token) {
        return false;
      }

      this.status = 'loading';

      api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

      try {
        const response = await UserService.getBasicUser();
        if (response.success) {
          this.user = response.data;
          this.status = 'success';
          return true;
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        this.status = 'error';
        this.user = null;
        this.token = null;
        localStorage.removeItem('user-token');
        delete api.defaults.headers.common['Authorization'];
        return false;
      }
    },

    logout() {
      const settingsStore = useSettingsStore();
      this.router.push('/');

      this.user = null;
      this.token = null;
      localStorage.removeItem('user-token');
      delete api.defaults.headers.common['Authorization'];

      settingsStore.clearSettings();
    },
  },
});
