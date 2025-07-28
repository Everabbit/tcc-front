<template>
  <q-card class="dialog-card">
    <q-form @submit="addProject" ref="form">
      <!-- Cabeçalho -->
      <q-card-section class="dialog-header">
        <div class="text-h6">Novo Projeto</div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Conteúdo -->
      <q-card-section class="dialog-content">
        <!-- Nome do Projeto -->
        <q-input
          label="Nome do Projeto *"
          v-model="projectCreateData.name"
          autofocus
          outlined
          class="q-mb-md"
          :rules="[required('Nome do projeto')]"
          hide-bottom-space
        />

        <!-- Descrição -->
        <q-input
          label="Descrição (Opcional)"
          v-model="projectCreateData.description"
          outlined
          type="textarea"
          rows="3"
          class="q-mb-md"
        />

        <!-- Preencher deadline -->
        <div class="q-mb-md">
          <q-input
            label="Prazo do Projeto"
            v-model="formattedData"
            readonly
            outlined
            mask="##/##/####"
            :rules="[(val) => typeof val === 'string' || '']"
            class="q-mt-sm"
          >
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="projectCreateData.deadline"
                    minimal
                    color="primary"
                    text-color="white"
                    today-btn
                  >
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="OK" color="primary" flat v-close-popup />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <!-- Upload de Banner -->
        <div class="q-mb-md">
          <label class="text-caption">Banner do Projeto (Opcional)</label>
          <q-file outlined v-model="bannerFile" accept="image/*" class="q-mt-sm">
            <template v-slot:prepend>
              <q-icon name="mdi-upload" />
            </template>
          </q-file>
        </div>
        <!-- Membros -->
        <div class="q-mb-md">
          <label class="text-caption">Membros Iniciais</label>

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
              v-model="projectCreateMemberData.id"
              label="Nome de usuário"
              @filter="filterUser"
              class="col-xs-12 col-sm-12 col-md-6 col-lg-6 col-xl-6"
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-plus" />
              </template>
            </q-select>

            <q-select
              outlined
              v-model="projectCreateMemberData.role"
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
            <q-item
              v-for="(member, index) in projectCreateData.members"
              :key="index"
              class="q-pa-sm"
            >
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
        <q-btn label="Criar Projeto" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { RolesEnum, RolesValues } from 'src/enums/roles.enum';
import { ProjectCreateI, ProjectMemberI } from 'src/models/project.model';
import { clone, fileToBase64, toBase64 } from 'src/utils/transform';
import { computed, onMounted, ref } from 'vue';
import { required, validateEmail, validateSelect } from '../../utils/validation';
import { QForm, useQuasar } from 'quasar';
import { ResponseI } from 'src/models/response.model';
import ProjectService from 'src/services/project.service';
import emitter from 'src/utils/event_bus';
import UserService from 'src/services/user.service';
import { UserBasicI } from 'src/models/user.model';

export default {
  setup() {
    const $q = useQuasar();
    const form = ref<QForm>(null);

    const projectCreateData = ref<ProjectCreateI>({
      name: '',
      deadline: '',
      description: '',
      members: [],
    });
    const bannerFile = ref<File>(null);
    const roles = clone(RolesValues);
    const usersList = ref<UserBasicI[]>([]);
    const userListClone = ref<UserBasicI[]>([]);

    const projectCreateMemberData = ref<ProjectMemberI>({
      role: 2,
    });

    const formattedData = computed<string>(() => {
      let formatted: string = projectCreateData.value.deadline;

      if (formatted) {
        const parts: string[] = formatted.split('/');
        if (parts.length === 3) {
          return (formatted = `${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      }
      return formatted;
    });

    function addMember() {
      if (!validateSelect(projectCreateMemberData.value.role)) {
        return $q.notify({
          color: 'negative',
          message: 'A função do membro é obrigatória  .',
          icon: 'mdi-alert-circle',
        });
      }

      const user = usersList.value.find((user) => user.id === projectCreateMemberData.value.id);

      projectCreateMemberData.value = {
        id: user.id,
        username: user.username,
        image: user.username,
        initials: user.initials,
        role: projectCreateMemberData.value.role,
      };

      projectCreateData.value.members.push(clone(projectCreateMemberData.value));
      projectCreateMemberData.value.id = null;
      projectCreateMemberData.value.role = 2;
    }

    function removeMember(index: number) {
      projectCreateData.value.members.splice(index, 1);
    }

    async function addProject(): Promise<void> {
      try {
        const isValid: boolean = await form.value.validate();

        if (isValid) {
          $q.loading.show();
          const formData: FormData = new FormData();
          formData.append('project', JSON.stringify(projectCreateData.value));
          if (bannerFile.value) {
            formData.append('banner', bannerFile.value);
          }

          const response: ResponseI = await ProjectService.create(formData);

          if (!response.success) {
            throw Error(response.message);
          }
          $q.loading.hide();
          $q.notify({
            type: 'positive',
            message: 'Projeto criado com successo!',
          });

          //limpar formulário
          projectCreateData.value = {
            name: '',
            deadline: '',
            description: '',
            members: [],
          };
          bannerFile.value = null;
          projectCreateMemberData.value = {
            id: null,
            role: 2,
          };

          //fechar popup
          emitter.emit('close');
        } else {
          $q.notify({
            type: 'negative',
            message: 'Corrija os erros no formulário',
          });
        }
      } catch (error) {
        $q.loading.hide();
        console.error('Erro na validação:', error.message);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao validar o formulário',
        });
      }
    }

    async function getUserList(): Promise<void> {
      try {
        const response: ResponseI = await UserService.getBasicUserList();

        if (!response.success) {
          throw Error(response.message);
        }
        usersList.value = response.data;
        userListClone.value = response.data;

        usersList.value.forEach((userBasic) => {
          userBasic.initials = userBasic.username.substring(0, 2).toUpperCase();
        });
      } catch (error) {
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: 'Ocorreu um erro ao buscar lista de usuários.',
        });
      }
    }

    function filterUser(val: string, update: (callbackFn: () => void) => void): void {
      if (val === '') {
        update(() => {
          usersList.value = userListClone.value;
        });
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        usersList.value = userListClone.value.filter(
          (v) => v.username.toLowerCase().indexOf(needle) > -1,
        );
      });
    }

    onMounted(async () => {
      await getUserList();
    });

    return {
      projectCreateData,
      formattedData,
      projectCreateMemberData,
      roles,
      addMember,
      required,
      removeMember,
      addProject,
      form,
      bannerFile,
      usersList,
      filterUser,
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
