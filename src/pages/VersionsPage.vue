<template>
  <q-page class="row justify-center items-start q-pa-md" style="min-height: 0px">
    <q-dialog persistent v-model="showDialog">
      <CreateVersionDialogComponent
        :project-id="idParse"
        v-if="showDialog"
      ></CreateVersionDialogComponent>
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

    <div class="versions-grid col-12 col-md-10 col-lg-9">
      <!-- Cards de versões -->
      <q-card flat v-for="version in versions" :key="version.id" class="version-card">
        <q-card-section>
          <div class="version-header">
            <div class="flex items-center q-gutter-sm">
              <span class="text-weight-bold" style="font-size: 18px; line-height: 1">
                {{ version.name }}
              </span>
              <q-badge
                :color="getProjectStatusColor(version.status)"
                :label="getProjectStatusName(version.status)"
              />
            </div>
            <q-btn flat round dense icon="edit" color="grey-7" />
          </div>
          <q-separator />
          <div class="q-mt-sm">
            <p class="version-description">{{ version.description }}</p>
          </div>

          <div class="version-meta flex q-gutter-sm q-mb-sm">
            <div v-if="version.endDate" class="text-caption text-grey">
              <q-icon name="mdi-calendar" size="16px" class="q-mr-sm" />
              <span>Prazo: {{ formatDate(version.endDate) }}</span>
            </div>
            <div v-if="version.githubBranch" class="text-caption text-grey">
              <q-icon name="mdi-github" size="16px" class="q-mr-sm" />
              <span>Branch: {{ version.githubBranch }}</span>
            </div>
          </div>
          <div>
            <div class="version-progress q-mb-xs">
              <span class="text-caption text-grey">Progresso:</span
              ><span class="text-caption text-grey">50%</span>
            </div>
            <q-linear-progress rounded :value="0.2" color="primary" size="6px" />
          </div>
          <q-separator class="q-my-md" />
          <span class="version-footer">
            <q-icon name="mdi-format-list-checks" />
            12/25 tarefas concluídas
          </span>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import CreateVersionDialogComponent from 'src/components/CreateVersionDialog.component.vue';
import { filterEnum } from 'src/enums/filter.enum';
import { sortEnum } from 'src/enums/sort.enum';
import { VersionStatus, VersionStatusEnum } from 'src/enums/status.enum';
import { ProjectI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import { VersionI } from 'src/models/version.model';
import ProjectService from 'src/services/project.service';
import VersionService from 'src/services/version.service';
import emitter from 'src/utils/event_bus';
import { clone, fromBase64, toBase64 } from 'src/utils/transform';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  components: { CreateVersionDialogComponent },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const $router = useRouter();
    const showDialog = ref<boolean>(false);
    const versions = ref<VersionI[]>();
    const idParse = ref<string>(fromBase64(props.id));
    const statusValues = clone(VersionStatus);

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
      await getVersions();
    }

    async function getVersions(): Promise<void> {
      try {
        $q.loading.show();
        const response: ResponseI = await VersionService.getAll(idParse.value);
        if (!response.success) {
          throw Error(response.message);
        }
        $q.loading.hide();
        versions.value = response.data;
      } catch (error) {
        $q.loading.hide();
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar projetos.',
        });
      }
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

    function getProjectStatusName(status: VersionStatusEnum): string {
      return statusValues.find((X) => X.id === status).name;
    }

    function getProjectStatusColor(status: VersionStatusEnum): string {
      return statusValues.find((X) => X.id === status).color;
    }

    onMounted(async () => {
      emitter.on('open-version-dialog', openDialog);
      emitter.on('close-version-dialog', closeDialog);
      await getVersions();
    });

    onBeforeUnmount(() => {
      emitter.off('open-version-dialog', openDialog);
      emitter.off('close-version-dialog', closeDialog);
    });

    return {
      showDialog,
      versions,
      getVersions,
      openDialog,
      statusFilter,
      statusOptions,
      sortFilter,
      sortOptions,
      idParse,
      getProjectStatusName,
      getProjectStatusColor,
      formatDate,
    };
  },
};
</script>

<style scopped>
.versions-grid {
  display: grid;
  gap: 20px;
}

.version-card {
  border-radius: 8px;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;
}

.version-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.version-header {
  display: flex;
  justify-content: space-between;
}

.version-description {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.version-progress {
  display: flex;
  justify-content: space-between;
}

.version-footer {
  color: #aaa;
  font-size: 0.9rem;
}
</style>
