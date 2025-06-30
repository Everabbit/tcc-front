<template>
  <q-page class="row justify-center items-start q-pa-md">
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn color="primary" icon="mdi-check" round size="20px">
        <q-tooltip
          class="bg-primary text-body2"
          position="top"
          anchor="bottom middle"
          self="top middle"
          :offset="[10, 10]"
        >
          Salvar
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-dialog persistent v-model="showDialogVersion">
      <CreateVersionDialog :project-id="id" v-if="showDialogVersion"></CreateVersionDialog>
    </q-dialog>
    <q-dialog persistent v-model="showDialogMembers">
      <AddMemberDialogCompoent :project-id="id" v-if="showDialogMembers"></AddMemberDialogCompoent>
    </q-dialog>
    <div class="col-12 col-md-10 col-lg-9 q-mb-md">
      <div class="q-mb-md">
        <q-btn flat round icon="arrow_back" @click="$router.back()" />
        <span class="text-h5 q-ml-sm">{{ project.name }}</span>
      </div>

      <!-- Banner -->
      <div
        v-if="!project.banner"
        class="project-banner q-mb-lg"
        :style="`background-color: ${getRandomColor()};`"
      ></div>
      <q-img v-else :src="project.banner" class="project-banner q-mb-lg"></q-img>

      <!-- Info do Projeto (CAMPOS EDITÁVEIS) -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="text-h6 q-mb-sm">Informações do Projeto</div>
          <q-separator />
          <div class="row q-col-gutter-lg q-mt-xs">
            <div class="col-12 col-md-6">
              <!-- Nome -->
              <div class="text-caption text-grey">Nome</div>
              <q-input v-model="project.name" dense outlined class="q-mt-xs" />

              <!-- Status -->
              <div class="text-caption text-grey q-mt-md">Status</div>
              <q-select
                v-model="project.status"
                :options="['Em andamento', 'Concluído', 'Pausado']"
                dense
                outlined
                emit-value
                map-options
                class="q-mt-xs"
              />

              <!-- Data de Criação (readonly) -->
              <div class="text-caption text-grey q-mt-md">Data de Criação</div>
              <div>{{ formatDate(project.createdAt) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <!-- Prazo -->
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
                          v-model="project.deadline"
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

              <!-- Progresso -->
              <div class="text-caption text-grey q-mt-md">Progresso</div>
              <div class="row">
                <div class="col-11 q-py-sm">
                  <q-linear-progress :value="project.progress / 100" color="primary" />
                </div>

                <div class="q-ml-sm">
                  <span>{{ project.progress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Descrição -->
          <div class="q-mt-md">
            <div class="text-caption text-grey">Descrição</div>
            <q-input v-model="project.description" type="textarea" outlined dense class="q-mt-xs" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Membros -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Membros do Projeto</div>
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar Membro"
              flat
              @click="addmembersDialog"
            />
          </div>
          <q-separator />

          <div class="q-mt-md">
            <q-item v-for="membro in project.participation" :key="membro.userId" class="q-mb-sm">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white"
                  ><img v-if="membro.user.image" :src="membro.user.image" />
                  <span v-else>{{ getUsernameInitials(membro.user.username) }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ membro.user.fullName }}</q-item-label>
                <q-item-label caption>{{ membro.user.username }}</q-item-label>
              </q-item-section>
              <q-item-section side class="row">
                <q-badge
                  :label="roles.find((role) => role.id === membro.role).name"
                  color="secondary"
                />
              </q-item-section>
              <q-item-section side class="row">
                <q-btn
                  flat
                  dense
                  icon="close"
                  class="q-ml-sm"
                  @click="removeMember(membro.userId)"
                />
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-card>

      <!-- Versões -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Versões</div>
            <q-btn color="primary" icon="add" label="Nova Versão" flat @click="createVersion" />
          </div>
          <q-separator />

          <q-markup-table flat class="q-mt-md">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Lançamento</th>
                <th>Progresso</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="versao in project.versions" :key="versao.id">
                <td>
                  <div class="text-center">{{ versao.name }}</div>
                </td>
                <td>
                  <div class="text-center">
                    <q-badge color="blue">{{
                      versionStatus.find((status) => status.id === versao.status).name
                    }}</q-badge>
                  </div>
                </td>
                <td>
                  <div class="text-center">{{ formatDate(versao.startDate) }}</div>
                </td>
                <td>
                  <div class="text-center">
                    <span> {{ 20 }}% </span>
                  </div>
                  <q-linear-progress :value="0 / 100" color="accent" />
                </td>
                <td class="text-right">
                  <q-btn flat dense icon="edit" />
                  <q-btn flat dense icon="delete" />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import AddMemberDialogCompoent from 'src/components/AddMemberDialog.compoent.vue';
import CreateVersionDialog from 'src/components/CreateVersionDialog.component.vue';
import { ProjectStatus } from 'src/enums/project_status.enum';
import { RolesValues } from 'src/enums/roles.enum';
import { VersionStatus } from 'src/enums/status.enum';
import { ProjectI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import ProjectService from 'src/services/project.service';
import emitter from 'src/utils/event_bus';
import { clone } from 'src/utils/transform';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  components: {
    CreateVersionDialog,
    AddMemberDialogCompoent,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const $router = useRouter();
    const project = ref<ProjectI>({
      creatorId: 0,
      name: '',
      status: ProjectStatus.UNACTIVE,
      progress: 0,
    });
    const roles = clone(RolesValues);
    const showDialogVersion = ref<boolean>(false);
    const showDialogMembers = ref<boolean>(false);
    const versionStatus = clone(VersionStatus);

    async function getProject(): Promise<void> {
      try {
        const response: ResponseI = await ProjectService.getOne(props.id);
        if (!response.success) {
          throw Error(response.message);
        }
        project.value = response.data;
      } catch (error) {
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar projeto.',
        });
        $router.push('/p/projetos');
      }
    }
    const formattedData = computed<string>(() => {
      console.log(project.value.deadline);
      if (project.value.deadline) {
        let formatted: string = project.value.deadline.toString();
        formatted = formatted.substring(0, 10);

        if (formatted) {
          const parts: string[] = formatted.split('-');
          if (parts.length === 3) {
            return (formatted = `${parts[2]}/${parts[1]}/${parts[0]}`);
          }
        }
        return formatted;
      } else {
        return '';
      }
    });

    function getRandomColor(): string {
      const pastelColors = [
        '#FFB3BA', // Pastel Red
        '#FFDFBA', // Pastel Orange
        '#FFFFBA', // Pastel Yellow
        '#BAFFC9', // Pastel Green
        '#BAE1FF', // Pastel Blue
        '#E0BBE4', // Pastel Purple
        '#FFC0CB', // Pink
        '#F0E68C', // Khaki
        '#ADD8E6', // Light Blue
        '#90EE90', // Light Green
      ];
      const randomIndex = Math.floor(Math.random() * pastelColors.length);
      return pastelColors[randomIndex];
    }

    function formatDate(date: Date): string {
      if (!date) {
        return '';
      }
      const newDate = new Date(date.toString());
      const day = newDate.getDate().toString().padStart(2, '0');
      const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
      const year = newDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    function getUsernameInitials(username: string): string {
      if (!username) return '';
      const names = username.split(' ');
      if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
      } else {
        return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
      }
    }

    function createVersion(): void {
      showDialogVersion.value = !showDialogVersion.value;
    }
    function addmembersDialog(): void {
      showDialogMembers.value = !showDialogMembers.value;
    }

    function removeMember(index: number): void {
      let member: string = project.value.participation.find((member) => member.userId === index)
        .user.username;
      $q.dialog({
        title: 'Confirmar Remoção',
        message: `Tem certeza de que deseja remover ${member} do projeto?`,
        cancel: {
          label: 'Não',
          color: 'grey',
          flat: true,
        },
        ok: {
          label: 'Sim',
          color: 'primary',
        },
        persistent: false,
      }).onOk(async () => {
        try {
          const response: ResponseI = await ProjectService.removeMember(props.id, index);

          if (!response.success) {
            throw Error(response.message);
          }

          $q.notify({
            type: 'positive',
            message: 'Membro removido com sucesso!',
          });

          await getProject();
        } catch (error) {
          console.error('Erro ao remover membro:', error);
          $q.notify({
            type: 'negative',
            message: error.message || 'Ocorreu um erro ao remover o membro.',
          });
        }
      });
    }

    onMounted(async () => {
      emitter.on('close-version-dialog', createVersion);
      emitter.on('close-members-dialog', addmembersDialog);
      await getProject();
    });

    onBeforeUnmount(() => {
      emitter.off('close-version-dialog', createVersion);
      emitter.off('close-members-dialog', addmembersDialog);
    });

    return {
      versionStatus,
      project,
      getRandomColor,
      formatDate,
      getUsernameInitials,
      roles,
      showDialogVersion,
      showDialogMembers,
      addmembersDialog,
      createVersion,
      removeMember,
      formattedData,
    };
  },
};
</script>

<style scoped>
.project-banner {
  height: 200px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
}

.card-project {
  border-left: 4px solid var(--primary-color);
}
</style>
