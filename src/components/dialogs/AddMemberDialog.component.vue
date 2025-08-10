<template>
  <q-card class="dialog-card">
    <q-form @submit="addMembers" ref="form">
      <!-- Cabeçalho -->
      <q-card-section class="dialog-header">
        <div class="text-h6">Adicionar Membros</div>
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
              v-model="memberData.id"
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

            <q-btn color="primary" icon="mdi-plus" @click="addMember" />
          </div>

          <!-- Lista de Membros -->
          <q-list bordered class="q-mt-md">
            <q-item v-for="(member, index) in memberList" :key="index" class="q-pa-sm">
              <q-item-section>{{ member.username }}</q-item-section>

              <q-item-section side>
                <q-badge color="primary">
                  {{ roles.find((role) => role.id === member.role).name }}
                </q-badge>
              </q-item-section>

              <q-item-section side>
                <q-btn icon="mdi-close" flat dense @click="removeMember(index)" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <!-- Rodapé -->
      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn label="Adicionar Membros" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { RolesValues } from 'src/enums/roles.enum';
import { ProjectMemberI } from 'src/models/project.model';
import { clone } from 'src/utils/transform';
import { onMounted, ref } from 'vue';
import { required, validateSelect } from '../../utils/validation';
import { QForm, useQuasar } from 'quasar';
import ProjectService from 'src/services/project.service';
import UserService from 'src/services/user.service';
import { UserBasicI } from 'src/models/user.model';
import { useApi } from 'src/services/useApi';

export default {
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const form = ref<QForm>(null);
    const { handleApi } = useApi();

    const roles = clone(RolesValues);
    const usersList = ref<UserBasicI[]>([]);
    const userListClone = ref<UserBasicI[]>([]);

    const memberData = ref<ProjectMemberI>({
      role: 2,
    });
    const memberList = ref<ProjectMemberI[]>([]);

    function addMember() {
      if (!memberData.value.id) {
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

      const user = usersList.value.find((u) => u.id === memberData.value.id);
      if (!user) {
        $q.notify({
          color: 'negative',
          message: 'Usuário inválido. Por favor, selecione novamente.',
          icon: 'mdi-alert-circle',
        });
        return;
      }

      const isAlreadyMember = memberList.value.some((member) => member.id === user.id);
      if (isAlreadyMember) {
        $q.notify({
          color: 'info',
          message: `${user.username} já está na lista para ser adicionado.`,
          icon: 'mdi-information',
        });
        memberData.value.id = null;
        return;
      }

      memberList.value.push({
        id: user.id,
        username: user.username,
        image: user.image,
        role: memberData.value.role,
      });

      memberData.value.id = null;
      memberData.value.role = 2;
      usersList.value = [];
    }

    function removeMember(index: number) {
      memberList.value.splice(index, 1);
    }

    async function addMembers(): Promise<void> {
      const isValid: boolean = await form.value.validate();

      if (isValid) {
        const formData: FormData = new FormData();
        formData.append('members', JSON.stringify(memberList.value));

        await handleApi(() => ProjectService.addMembers(props.projectId, formData), {
          successMessage: 'Membros adicionados com sucesso!',
          errorMessage: 'Ocorreu um erro ao adicionar membros.',
        });

        memberList.value = [];
        memberData.value = {
          id: null,
          role: 2,
        };
        emit('close');
      } else {
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
      }
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
      memberList,
      memberData,
      roles,
      addMember,
      required,
      removeMember,
      addMembers,
      form,
      usersList,
      getUserList,
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
