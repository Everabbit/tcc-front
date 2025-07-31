<template>
  <q-page class="row justify-center items-start q-pa-md" style="min-height: 0px">
    <q-dialog persistent v-model="showDialog">
      <CreateVersionDialogComponent
        @close="closeDialog"
        :project-id="idParse"
        :version-id="versionEditId"
        v-if="showDialog"
      ></CreateVersionDialogComponent>
    </q-dialog>

    <div
      class="row col-12 col-md-10 col-lg-9 q-mb-md q-gutter-sm flex items-center justify-between"
    >
      <!-- Botão de voltar -->
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <!-- Filtro -->
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

    <div
      v-if="versionsFiltered && versionsFiltered.length > 0"
      class="versions-grid col-12 col-md-10 col-lg-9"
    >
      <!-- Cards de versões -->
      <q-card
        flat
        v-for="version in versionsFiltered"
        :key="version.id"
        class="version-card"
        @click="gotToTasks(version.id)"
      >
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
            <div>
              <q-btn
                flat
                round
                dense
                icon="mdi-pencil"
                color="grey-7"
                @click.stop="openDialog(version.id)"
              />
              <q-btn
                flat
                round
                dense
                icon="mdi-delete"
                color="grey-7"
                @click.stop="removeVersion(version.id)"
              />
            </div>
          </div>
          <q-separator />
          <div class="q-mt-sm">
            <p class="version-description">{{ version.description }}</p>
          </div>

          <div class="version-meta flex q-gutter-sm q-mb-sm">
            <div v-if="version.startDate" class="text-caption text-grey">
              <q-icon name="mdi-calendar" size="16px" class="q-mr-sm" />
              <span>Inicio: {{ formatDate(version.startDate) }}</span>
            </div>
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
    <div v-else>
      <div class="col-12 text-center text-grey-7">
        <q-icon name="mdi-information-outline" size="50px" />
        <p class="text-h6">Nenhuma versão encontrada.</p>
        <p class="text-subtitle1">Parece que não encontramos nenhuma versão para esses filtros.</p>
        <q-btn color="primary" icon="add" label="Criar Nova Versão" @click="openDialog()" />
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import CreateVersionDialogComponent from 'src/components/dialogs/CreateVersionDialog.component.vue';
import { filterEnum, filterVersionEnum } from 'src/enums/filter.enum';
import { sortEnum } from 'src/enums/sort.enum';
import { VersionStatus, VersionStatusEnum } from 'src/enums/status.enum';
import { ProjectI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import { VersionI } from 'src/models/version.model';
import ProjectService from 'src/services/project.service';
import VersionService from 'src/services/version.service';
import emitter from 'src/utils/event_bus';
import { clone, fromBase64, toBase64 } from 'src/utils/transform';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatDate } from 'src/utils/utils';

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
    const versionEditId = ref<string>(null);

    const statusFilter = ref<number>(1);
    const statusOptions = ref<{ id: filterVersionEnum; value: string }[]>([
      { id: filterVersionEnum.ALL, value: 'Todos' },
      { id: filterVersionEnum.DRAFT, value: 'Rascunho' },
      { id: filterVersionEnum.DEVELOPMENT, value: 'Em desenvolvimento' },
      { id: filterVersionEnum.TESTING, value: 'Em testes' },
      { id: filterVersionEnum.STAGING, value: 'Preparada pro deploy' },
      { id: filterVersionEnum.RELEASED, value: 'Lançada' },
      { id: filterVersionEnum.DEPRECATED, value: 'Depreciada' },
      { id: filterVersionEnum.ROLLED_BACK, value: 'Revertida' },
    ]);

    const sortFilter = ref<number>(1);
    const sortOptions = ref<{ id: number; value: string }[]>([
      { id: sortEnum.NEWEST, value: 'Mais recentes' },
      { id: sortEnum.OLDEST, value: 'Mais antigos' },
      { id: sortEnum.DATE_LIMIT, value: 'Prazo mais próximo' },
      { id: sortEnum.A_Z, value: 'Nome (A-Z)' },
    ]);

    function openDialog(id: number | null = null): void {
      if (id) {
        versionEditId.value = toBase64(id.toString());
      } else {
        versionEditId.value = null;
      }
      showDialog.value = true;
    }

    async function closeDialog(): Promise<void> {
      showDialog.value = false;
      await getVersions();
    }

    const versionsFiltered = computed(() => {
      if (!versions.value) {
        return [];
      }

      let filtered = clone(versions.value);
      switch (statusFilter.value) {
        case filterVersionEnum.ALL:
          break;
        case filterVersionEnum.DRAFT:
          filtered = filtered.filter((version) => version.status === VersionStatusEnum.DRAFT);
          break;
        case filterVersionEnum.DEVELOPMENT:
          filtered = filtered.filter((version) => version.status === VersionStatusEnum.DEVELOPMENT);
          break;
        case filterVersionEnum.TESTING:
          filtered = filtered.filter((version) => version.status === VersionStatusEnum.TESTING);
          break;
        case filterVersionEnum.STAGING:
          filtered = filtered.filter((version) => version.status === VersionStatusEnum.STAGING);
          break;
        case filterVersionEnum.RELEASED:
          filtered = filtered.filter((version) => version.status === VersionStatusEnum.RELEASED);
          break;
        case filterVersionEnum.DEPRECATED:
          filtered = filtered.filter((version) => version.status === VersionStatusEnum.DEPRECATED);
          break;
        case filterVersionEnum.ROLLED_BACK:
          filtered = filtered.filter((version) => version.status === VersionStatusEnum.ROLLED_BACK);
          break;
      }

      switch (sortFilter.value) {
        case sortEnum.NEWEST:
          filtered.sort(
            (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
          );
          break;
        case sortEnum.OLDEST:
          filtered.sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
          );
          break;
        case sortEnum.DATE_LIMIT:
          filtered.sort((a, b) => {
            if (!a.endDate) return 1;
            if (!b.endDate) return -1;
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          });
          break;
      }
      return filtered;
    });

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
          message: error.message || 'Ocorreu um erro ao buscar versões.',
        });
      }
    }

    function gotToTasks(id: number) {
      $router.push(`/p/projetos/versoes/tarefas/${props.id}/${toBase64(id.toString())}`);
    }

    async function removeVersion(id: number): Promise<void> {
      $q.dialog({
        title: 'Confirmar Remoção',
        message: 'Tem certeza de que deseja remover permanentemente esta versão?',
        cancel: {
          label: 'Não',
          color: 'grey',
          flat: true,
        },
        ok: {
          label: 'Sim',
          color: 'red',
        },
        persistent: false,
      }).onOk(async () => {
        try {
          $q.loading.show();
          const response: ResponseI = await VersionService.delete(id.toString());
          if (!response.success) {
            throw Error(response.message);
          }
          $q.loading.hide();
          $q.notify({
            type: 'positive',
            message: 'Versão removida com sucesso!',
          });
          await getVersions();
        } catch (error) {
          $q.loading.hide();
          console.error('Erro ao remover versão:', error.message);
          $q.notify({
            type: 'negative',
            message: error.message || 'Ocorreu um erro ao remover a versão',
          });
        }
      });
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
      versionEditId,
      removeVersion,
      gotToTasks,
      closeDialog,
      versionsFiltered,
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
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
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
