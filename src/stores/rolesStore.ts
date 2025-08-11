import { defineStore } from 'pinia';
import { RolesEnum } from 'src/enums/roles.enum';
import UserService from 'src/services/user.service';

export const useRolesStore = defineStore('roles', {
  state: () => ({
    role: null as RolesEnum,
    roleLoaded: false,
  }),

  getters: {
    hasPermission: (state) => (requiredRole: RolesEnum) => {
      if (!state.role) {
        return false;
      }

      if (state.role === RolesEnum.ADMIN) {
        return true;
      }

      if (state.role === RolesEnum.MANAGER) {
        return (
          requiredRole === RolesEnum.MANAGER ||
          requiredRole === RolesEnum.DEVELOPER ||
          requiredRole === RolesEnum.ANALYST
        );
      }

      return state.role === requiredRole;
    },
  },

  actions: {
    async fetchAndSetRole(projectId: number) {
      if (this.roleLoaded) {
        return;
      }

      try {
        const response = await UserService.getUserRole(projectId);
        if (!response.success) throw new Error(response.message);
        this.role = response.data;

        this.roleLoaded = true;
      } catch (error) {
        console.error('Falha ao buscar role:', error);
      }
    },
  },
});
