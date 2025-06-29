<template>
  <q-page class="row justify-center items-start q-pa-md">
    <q-dialog persistent v-model="showDialogVersion">
      <CreateVersionDialog :project-id="id" v-if="showDialogVersion"></CreateVersionDialog>
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

      <!-- Info do Projeto -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="text-h6 q-mb-sm">Informações do Projeto</div>
          <q-separator />
          <div class="row q-col-gutter-lg q-mt-xs">
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">Nome</div>
              <div class="text-subtitle1">{{ project.name }}</div>

              <div class="text-caption text-grey q-mt-md">Status</div>
              <q-badge color="green" label="Em andamento" />

              <div class="text-caption text-grey q-mt-md">Data de Criação</div>
              <div>{{ formatDate(project.createdAt) }}</div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-caption text-grey">Prazo</div>
              <div>{{ formatDate(project.deadline) }}</div>

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
          <div class="q-mt-md">
            <div class="text-caption text-grey">Descrição</div>
            <div>
              {{ project.description }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Membros -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Membros do Projeto</div>
            <q-btn color="primary" icon="add" label="Adicionar Membro" flat />
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
                <q-btn flat dense icon="close" class="q-ml-sm" />
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
                <td>{{ versao.name }}</td>
                <td>
                  <div class="text-center">
                    <q-badge color="blue">{{ versao.status }}</q-badge>
                  </div>
                </td>
                <td>
                  <div class="text-center">{{ versao.startDate }}</div>
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
import CreateVersionDialog from 'src/components/CreateVersionDialog.component.vue';
import { ProjectStatus } from 'src/enums/project_status.enum';
import { RolesValues } from 'src/enums/roles.enum';
import { ProjectI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import ProjectService from 'src/services/project.service';
import emitter from 'src/utils/event_bus';
import { clone } from 'src/utils/transform';
import { onBeforeUnmount, onMounted } from 'vue';
import { ref } from 'vue';

export default {
  components: {
    CreateVersionDialog,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const project = ref<ProjectI>({
      creatorId: 0,
      name: '',
      status: ProjectStatus.UNACTIVE,
      progress: 0,
    });
    const roles = clone(RolesValues);
    const showDialogVersion = ref<boolean>(false);

    async function getProject(): Promise<void> {
      try {
        const response: ResponseI = await ProjectService.getOne(props.id);
        if (!response.success) {
          throw Error(response.message);
        }
        project.value = response.data;
        console.log(project.value);
      } catch (error) {
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar lista de projetos.',
        });
      }
    }

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

    onMounted(async () => {
      emitter.on('close-version-dialog', createVersion);
      await getProject();
    });

    onBeforeUnmount(() => {
      emitter.off('close-version-dialog', createVersion);
    });

    return {
      project,
      getRandomColor,
      formatDate,
      getUsernameInitials,
      roles,
      showDialogVersion,
      createVersion,
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
