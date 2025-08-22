import { defineStore } from 'pinia';
import { RolesEnum } from 'src/enums/roles.enum';
import UserService from 'src/services/user.service';

export const useRolesStore = defineStore('roles', {
  state: () => ({
    role: null as RolesEnum,
  }),

  getters: {
    hasPermission: (state) => (requiredRole: RolesEnum) => {
      if (!state.role) {
        return false;
      }

      return state.role <= requiredRole;
    },
  },

  actions: {
    async fetchAndSetRole(projectId: number) {
      try {
        const response = await UserService.getUserRole(projectId);
        if (!response.success) {
          this.role = null as RolesEnum;
          throw new Error(response.message);
        }
        this.role = response.data;
      } catch (error) {
        console.error('Falha ao buscar role:', error);
      }
    },

    resetRole() {
      this.role = null as RolesEnum;
    },
  },
});
