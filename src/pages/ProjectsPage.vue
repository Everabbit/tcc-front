<template>
  <q-page class="row justify-center items-start q-pa-md" style="min-height: 0px">
    <q-dialog persistent v-model="showDialog">
      <CreateProjectDialog v-if="showDialog"></CreateProjectDialog>
    </q-dialog>

    <div class="row col-12 col-md-10 col-lg-9 q-mb-md q-gutter-sm">
      <!-- Filtro de Status -->
      <div class="filter-group">
        <span class="filter-label">Status:</span>
        <q-select
          dense
          outlined
          v-model="statusFilter"
          :options="statusOptions"
          map-options
          emit-value
          option-value="id"
          option-label="value"
          style="min-width: 150px"
          class="filter-select"
          @update:model-value="filterProjects"
        />
      </div>

      <!-- Filtro de Ordenação -->
      <div class="filter-group">
        <span class="filter-label">Ordenar por:</span>
        <q-select
          dense
          outlined
          v-model="sortFilter"
          :options="sortOptions"
          map-options
          emit-value
          option-value="id"
          option-label="value"
          style="min-width: 180px"
          class="filter-select"
          @update:model-value="filterProjects"
        />
      </div>
    </div>

    <div class="projects-grid col-12 col-md-10 col-lg-9">
      <!-- Cards de projetos -->
      <q-card
        flat
        v-for="project in projects"
        :key="project.id"
        class="project-card"
        @click="toVersions(project.id)"
      >
        <div
          v-if="!project.banner"
          class="project-banner"
          :style="`background-color: ${getRandomColor()}`"
        ></div>
        <q-img v-else :src="project.banner" class="project-banner"></q-img>
        <q-card-section>
          <div class="project-header">
            <span style="font-size: 18px" class="text-weight-bold q-my-none">{{
              project.name
            }}</span>
            <q-btn
              flat
              round
              dense
              icon="edit"
              color="grey-7"
              @click.stop="toProject(project.id)"
            />
          </div>
          <p class="project-description">{{ project.description }}</p>
          <div class="project-meta">
            <q-badge
              :color="getProjectStatusColor(project.status)"
              :label="getProjectStatusName(project.status)"
            />
            <div v-if="project.deadline" class="text-caption text-grey">
              <q-icon name="event" size="16px" class="q-mr-sm" />
              <span>Prazo: {{ formatDate(project.deadline) }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-actions class="project-footer">
          <div class="project-members">
            <q-avatar
              v-if="project.participation[0] && project.participation[0].user"
              size="30px"
              color="primary"
              text-color="white"
            >
              <q-img
                v-if="project.participation[0].user.image"
                :src="project.participation[0].user.image"
              />
              <span v-else>{{ getUsernameInitials(project.participation[0].user.username) }}</span>
            </q-avatar>
            <q-avatar
              v-if="
                project.participation.length > 1 &&
                project.participation[1] &&
                project.participation[1].user
              "
              size="30px"
              color="teal"
              text-color="white"
              style="margin-left: -8px"
            >
              <q-img
                v-if="project.participation[1].user.image"
                :src="project.participation[1].user.image"
              />
              <span v-else>{{ getUsernameInitials(project.participation[1].user.username) }}</span>
            </q-avatar>
            <q-avatar
              v-if="project.participation.length > 2"
              size="30px"
              color="grey-7"
              text-color="white"
              style="margin-left: -8px"
              >+{{ project.participation.length - 2 }}</q-avatar
            >
          </div>
          <div class="project-progress">
            <q-linear-progress
              :value="project.progress / 100"
              color="primary"
              size="6px"
              style="width: 80px"
            />
            <span class="text-caption text-grey">{{ project.progress }}%</span>
          </div>
        </q-card-actions>
      </q-card>

      <!-- Card de novo projeto -->
      <q-card flat class="new-project-card" @click="openDialog">
        <q-card-section class="add-project-button">
          <q-icon name="add" color="primary" size="2rem" />
          <div>Adicionar novo projeto</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import CreateProjectDialog from 'src/components/CreateProjectDialog.component.vue';
import { filterEnum } from 'src/enums/filter.enum';
import { ProjectStatus, ProjectStatusValues } from 'src/enums/project_status.enum';
import { sortEnum } from 'src/enums/sort.enum';
import { ProjectI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import ProjectService from 'src/services/project.service';
import emitter from 'src/utils/event_bus';
import { clone, toBase64 } from 'src/utils/transform';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  components: { CreateProjectDialog },

  setup() {
    const $q = useQuasar();
    const $router = useRouter();
    const showDialog = ref<boolean>(false);
    const projects = ref<ProjectI[]>([]);
    const projectsClone = ref<ProjectI[]>([]);
    const StatusValues = clone(ProjectStatusValues);

    const statusFilter = ref<number>(1);
    const statusOptions = ref<{ id: number; value: string }[]>([
      { id: filterEnum.ALL, value: 'Todos' },
      { id: filterEnum.ACTIVED, value: 'Ativos' },
      { id: filterEnum.UNACTIVE, value: 'Inativos' },
      { id: filterEnum.ARCHIVED, value: 'Arquivados' },
    ]);

    const sortFilter = ref<number>(1);
    const sortOptions = ref<{ id: number; value: string }[]>([
      { id: sortEnum.NEWEST, value: 'Mais recentes' },
      { id: sortEnum.OLDEST, value: 'Mais antigos' },
      { id: sortEnum.DATE_LIMIT, value: 'Prazo mais próximo' },
      { id: sortEnum.A_Z, value: 'Nome (A-Z)' },
    ]);

    function openDialog(): void {
      showDialog.value = true;
    }

    async function closeDialog(): Promise<void> {
      showDialog.value = false;
      await getProjects();
    }

    async function getProjects(): Promise<void> {
      try {
        $q.loading.show();
        const response: ResponseI = await ProjectService.getAll();
        if (!response.success) {
          throw Error(response.message);
        }
        $q.loading.hide();
        projects.value = response.data;
        projectsClone.value = response.data;
      } catch (error) {
        $q.loading.hide();
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar projetos.',
        });
      }
    }

    function filterProjects(): void {
      projects.value = clone(projectsClone.value);
      switch (statusFilter.value) {
        case filterEnum.ALL:
          projects.value = clone(projectsClone.value);
          break;
        case filterEnum.ACTIVED:
          projects.value = projects.value.filter(
            (project) => project.status === ProjectStatus.ACTIVE,
          );
          break;
        case filterEnum.UNACTIVE:
          projects.value = projects.value.filter(
            (project) => project.status === ProjectStatus.UNACTIVE,
          );
          break;
        case filterEnum.ARCHIVED:
          projects.value = projects.value.filter(
            (project) => project.status === ProjectStatus.ARCHIVED,
          );
          break;
      }
      switch (sortFilter.value) {
        case sortEnum.NEWEST:
          projects.value.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
        case sortEnum.OLDEST:
          projects.value.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          break;
        case sortEnum.DATE_LIMIT:
          projects.value.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          });
          break;
        case sortEnum.A_Z:
          projects.value.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
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

    function toProject(id: number) {
      $router.push('projetos/' + toBase64(id.toString()));
    }

    function toVersions(id: number) {
      $router.push('projetos/versoes/' + toBase64(id.toString()));
    }

    function getRandomColor(): string {
      const pastelColors = [
        // '#FFB3BA', // Pastel Red
        // '#FFDFBA', // Pastel Orange
        // '#FFFFBA', // Pastel Yellow
        // '#BAFFC9', // Pastel Green
        '#BAE1FF', // Pastel Blue
        // '#E0BBE4', // Pastel Purple
        // '#FFC0CB', // Pink
        // '#F0E68C', // Khaki
        // '#ADD8E6', // Light Blue
        // '#90EE90', // Light Green
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

    function getProjectStatusName(status: ProjectStatus): string {
      return StatusValues.find((X) => X.id === status).name;
    }

    function getProjectStatusColor(status: ProjectStatus): string {
      return StatusValues.find((X) => X.id === status).color;
    }

    onMounted(async () => {
      emitter.on('open-project-dialog', openDialog);
      emitter.on('close-project-dialog', closeDialog);
      await getProjects();
      filterProjects();
    });

    onBeforeUnmount(() => {
      emitter.off('open-project-dialog', openDialog);
      emitter.off('close-project-dialog', closeDialog);
    });

    return {
      showDialog,
      projects,
      openDialog,
      getRandomColor,
      formatDate,
      getUsernameInitials,
      ProjectStatus,
      toProject,
      toVersions,
      statusFilter,
      statusOptions,
      sortFilter,
      sortOptions,
      filterProjects,
      getProjectStatusName,
      getProjectStatusColor,
    };
  },
};
</script>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  border-radius: 8px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.project-banner {
  height: 120px;
  background-size: cover;
  background-position: center;
}

.project-header {
  display: flex;
  justify-content: space-between;
}

.project-description {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px;
}

.project-members {
  display: flex;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-project-card {
  border: 2px dashed #444;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 100%;
  min-height: 200px;
}

.new-project-card:hover {
  border-color: #007bff;
  background: rgba(0, 123, 255, 0.05);
}

.add-project-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #007bff;
}
</style>
