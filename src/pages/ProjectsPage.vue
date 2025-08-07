<template>
  <q-page class="row justify-center items-start q-pa-md" style="min-height: 0px">
    <q-dialog persistent v-model="showDialog">
      <CreateProjectDialog v-if="showDialog" @close="closeDialog"></CreateProjectDialog>
    </q-dialog>

    <div class="row col-12 col-md-10 col-lg-9 q-mb-md q-gutter-sm">
      <!-- Filtro de Status -->
      <q-space></q-space>
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
        />
      </div>
    </div>

    <div class="projects-grid col-12 col-md-10 col-lg-9">
      <!-- Cards de projetos -->
      <div v-for="project in projectsFiltered" :key="project.id">
        <ProjectCardComponent :project="project" />
      </div>

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
import ProjectCardComponent from 'src/components/cards/ProjectCard.component.vue';
import CreateProjectDialog from 'src/components/dialogs/CreateProjectDialog.component.vue';
import { filterEnum } from 'src/enums/filter.enum';
import { ProjectStatus } from 'src/enums/project_status.enum';
import { sortEnum } from 'src/enums/sort.enum';
import { ProjectI } from 'src/models/project.model';
import ProjectService from 'src/services/project.service';
import { useApi } from 'src/services/useApi';
import emitter from 'src/utils/event_bus';
import { clone } from 'src/utils/transform';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

export default {
  components: { CreateProjectDialog, ProjectCardComponent },

  setup() {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const showDialog = ref<boolean>(false);
    const projects = ref<ProjectI[]>([]);

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
      const data = await handleApi<ProjectI[]>(() => ProjectService.getAll(), {
        errorMessage: 'Ocorreu um erro ao buscar projetos.',
      });
      projects.value = data;
    }

    const projectsFiltered = computed(() => {
      if (!projects.value) {
        return [];
      }

      let filtered = clone(projects.value);
      switch (statusFilter.value) {
        case filterEnum.ALL:
          break;
        case filterEnum.ACTIVED:
          filtered = filtered.filter((project) => project.status === ProjectStatus.ACTIVE);
          break;
        case filterEnum.UNACTIVE:
          filtered = filtered.filter((project) => project.status === ProjectStatus.UNACTIVE);
          break;
        case filterEnum.ARCHIVED:
          filtered = filtered.filter((project) => project.status === ProjectStatus.ARCHIVED);
          break;
      }

      switch (sortFilter.value) {
        case sortEnum.NEWEST:
          filtered.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
        case sortEnum.OLDEST:
          filtered.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          break;
        case sortEnum.DATE_LIMIT:
          filtered.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          });
          break;
        case sortEnum.A_Z:
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
      return filtered;
    });

    onMounted(async () => {
      emitter.on('open-project-dialog', openDialog);
      await getProjects();
    });

    onBeforeUnmount(() => {
      emitter.off('open-project-dialog', openDialog);
    });

    return {
      showDialog,
      openDialog,
      closeDialog,
      ProjectStatus,
      statusFilter,
      statusOptions,
      sortFilter,
      sortOptions,
      projectsFiltered,
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
