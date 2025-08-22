<template>
  <q-card class="dialog-card">
    <q-form @submit="addMember" ref="form">
      <!-- Cabeçalho -->
      <q-card-section class="dialog-header">
        <div class="text-h6">Adicionar Membro</div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Conteúdo -->
      <q-card-section class="dialog-content">
        <!-- Membros -->
        <div class="q-mb-md">
          <div class="row q-gutter-sm q-mt-sm">
            <q-select
              use-input
              outlined
              :options="usersList"
              map-options
              emit-value
              option-value="id"
              option-label="username"
              hide-bottom-space
              v-model="memberData.userId"
              label="Nome de usuário"
              @filter="getUserList"
              class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-plus" />
              </template>
            </q-select>

            <q-select
              outlined
              v-model="memberData.role"
              :options="roles"
              map-options
              option-label="name"
              option-value="id"
              emit-value
              label="Função"
              class="col"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-tie" />
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>

      <!-- Rodapé -->
      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn
          :label="isEditing ? 'Editar Membro' : 'Adicionar Membro'"
          color="primary"
          type="submit"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { RolesValues } from 'src/enums/roles.enum';
import { ProjectParticipationI } from 'src/models/project.model';
import { clone } from 'src/utils/transform';
import { onMounted, PropType, ref } from 'vue';
import { required, validateSelect } from '../../utils/validation';
import { QForm, useQuasar } from 'quasar';
import ProjectService from 'src/services/project.service';
import UserService from 'src/services/user.service';
import { UserBasicI } from 'src/models/user.model';
import { useApi } from 'src/services/useApi';
import { useRolesStore } from 'src/stores/rolesStore';

export default {
  props: {
    projectId: {
      type: Number,
      required: true,
    },
    member: {
      type: Object as PropType<ProjectParticipationI>,
      required: false,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const form = ref<QForm>(null);
    const { handleApi } = useApi();
    const useRoles = useRolesStore();

    const roles = clone(RolesValues).filter((role) => role.id > useRoles.role);
    const usersList = ref<UserBasicI[]>([]);

    const memberData = ref<ProjectParticipationI>({
      role: 2,
    });

    const isEditing = ref<boolean>(!!props.member);

    if (isEditing.value) {
      memberData.value = props.member;
      const user: UserBasicI = {
        id: props.member.userId,
        username: props.member.user.username,
      };
      usersList.value.push(user);
    }

    async function addMember(): Promise<void> {
      if (!memberData.value.userId) {
        $q.notify({
          color: 'negative',
          message: 'Por favor, selecione um usuário da lista.',
          icon: 'mdi-alert-circle',
        });
        return;
      }

      if (!validateSelect(memberData.value.role)) {
        $q.notify({
          color: 'negative',
          message: 'A função do membro é obrigatória.',
          icon: 'mdi-alert-circle',
        });
        return;
      }

      const user = usersList.value.find((u) => u.id === memberData.value.userId);

      if (!user) {
        $q.notify({
          color: 'negative',
          message: 'Usuário inválido. Por favor, selecione novamente.',
          icon: 'mdi-alert-circle',
        });
        return;
      }

      const memberUser: ProjectParticipationI = {
        userId: memberData.value.userId,
        role: memberData.value.role,
      };

      if (isEditing.value) {
        await handleApi(() => ProjectService.updateMember(props.projectId, memberUser), {
          successMessage: 'Membro atualizado com sucesso!',
          errorMessage: 'Ocorreu um erro ao atualizr membro.',
        });
      } else {
        await handleApi(() => ProjectService.addMember(props.projectId, memberUser), {
          successMessage: 'Solicitação de participação enviada com sucesso!',
          errorMessage: 'Ocorreu um erro ao adicionar membro.',
        });
      }

      memberData.value = {
        userId: null,
        role: 2,
      };
      emit('close');
    }

    async function getUserList(
      inputValue: string,
      update: (callbackFn: () => void) => void,
    ): Promise<void> {
      if (!inputValue) {
        update(() => {
          usersList.value = [];
        });
        return;
      }

      const data = await handleApi<UserBasicI[]>(() => UserService.getBasicUserList(inputValue), {
        errorMessage: 'Ocorreu um erro ao buscar lista de usuários.',
      });

      update(() => {
        usersList.value = data || [];
      });
    }

    return {
      memberData,
      roles,
      required,
      addMember,
      form,
      usersList,
      getUserList,
      isEditing,
    };
  },
};
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 800px;
  min-width: 0;
  color: var(--text-color);
  box-sizing: border-box;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding: 15px 20px;
  flex-wrap: wrap;
}

.dialog-content {
  padding: 20px;
  overflow: auto;
}

.dialog-footer {
  border-top: 1px solid #333;
  padding: 15px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .dialog-header,
  .dialog-content,
  .dialog-footer {
    padding: 12px 15px;
  }
}

@media (max-width: 480px) {
  .dialog-header {
    align-items: flex-start;
    gap: 10px;
  }

  .dialog-header,
  .dialog-content,
  .dialog-footer {
    padding: 10px 12px;
  }
}
</style>
