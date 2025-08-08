import { defineStore } from 'pinia';
import { Dark, Notify, setCssVar } from 'quasar';
import { UserPreferencesI } from 'src/models/user.model';
import UserService from 'src/services/user.service';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null as UserPreferencesI | null,
    settingsLoaded: false,
  }),

  actions: {
    async fetchAndApplySettings() {
      if (this.settingsLoaded) {
        return;
      }

      try {
        const response = await UserService.getPreferences();
        if (!response.success) throw new Error(response.message);
        this.settings = response.data;

        this.applyCurrentTheme();

        this.settingsLoaded = true;
      } catch (error) {
        console.error('Falha ao buscar configurações:', error);
        Notify.create({
          type: 'warning',
          message: 'Não foi possível carregar suas preferências de tema.',
        });
      }
    },

    applyCurrentTheme() {
      if (this.settings) {
        Dark.set(this.settings.darkMode);
        setCssVar('primary', this.settings.theme);
      }
    },

    async updateDarkMode(isDark: boolean) {
      if (!this.settings) return;

      this.settings.darkMode = isDark;
      this.applyCurrentTheme();

      try {
        const preferences: UserPreferencesI = {
          darkMode: isDark,
        };

        const response = await UserService.updatePreferences(preferences);
        if (!response.success) throw new Error(response.message);

        Notify.create({
          type: 'positive',
          message: 'Preferência de tema salva com sucesso.',
        });
        this.fetchAndApplySettings();
      } catch (error) {
        this.settings.darkMode = !isDark;
        this.applyCurrentTheme();
        Notify.create({
          type: 'negative',
          message: 'Falha ao salvar a preferência de tema.',
        });
      }
    },

    async updateThemeColor(color: string) {
      if (!this.settings) return;

      this.settings.theme = color;
      this.applyCurrentTheme();

      try {
        const preferences: UserPreferencesI = {
          theme: color,
        };

        const response = await UserService.updatePreferences(preferences);
        if (!response.success) throw new Error(response.message);

        Notify.create({
          type: 'positive',
          message: 'Cor do tema salva com sucesso.',
        });
        this.fetchAndApplySettings();
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: 'Falha ao salvar a cor do tema.',
        });
      }
    },

    async updateNotifications(preferences: UserPreferencesI) {
      if (!this.settings) return;

      this.settings.notifyEnabled = preferences.notifyEnabled;
      this.settings.notifyEmail = preferences.notifyEmail;
      this.settings.notifyPush = preferences.notifyPush;

      try {
        const response = await UserService.updatePreferences(preferences);
        if (!response.success) throw new Error(response.message);

        Notify.create({
          type: 'positive',
          message: 'Preferências de notificação salvas com sucesso.',
        });
        this.fetchAndApplySettings();
      } catch (error) {
        Notify.create({
          type: 'negative',
          message: 'Falha ao salvar as preferências de notificação.',
        });
      }
    },

    clearSettings() {
      this.settings = {
        darkMode: true,
        theme: '#007bff',
        notifyEnabled: false,
        notifyEmail: false,
        notifyPush: false,
      };
      this.applyCurrentTheme();
      this.settingsLoaded = false;
    },
  },
});
