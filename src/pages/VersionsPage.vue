<template>
  <q-page class="row justify-center items-start q-pa-md" style="min-height: 0px">
    <q-dialog v-model="showDialog" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <CreateVersionDialogComponent
        @close="closeDialog"
        :project-id="idParse"
        :version-id="versionEditId"
        v-if="showDialog"
      ></CreateVersionDialogComponent>
    </q-dialog>

    <div class="row col-12 col-md-10 col-lg-9 q-mb-md flex items-center">
      <!-- Botão de voltar -->
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <q-space></q-space>
      <!-- Filtro -->
      <div class="filter-group q-mb-xs">
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
      <div :class="'filter-group' + ($q.screen.xs ? ' full-width' : '')">
        <q-space></q-space>
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
      <div v-for="version in versionsFiltered" :key="version.id">
        <VersionCardComponent
          :version="version"
          @open-version-dialog="openDialog"
          @remove-version="removeVersion"
        />
      </div>
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
import { filterVersionEnum } from 'src/enums/filter.enum';
import { sortEnum } from 'src/enums/sort.enum';
import { VersionStatusEnum } from 'src/enums/status.enum';
import { VersionI } from 'src/models/version.model';
import VersionService from 'src/services/version.service';
import emitter from 'src/utils/event_bus';
import { clone, fromBase64, toBase64 } from 'src/utils/transform';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useApi } from 'src/services/useApi';
import VersionCardComponent from 'src/components/cards/VersionCard.component.vue';
import socket from 'src/services/socket.service';

export default {
  components: { CreateVersionDialogComponent, VersionCardComponent },
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const showDialog = ref<boolean>(false);
    const versions = ref<VersionI[]>();
    const idParse = ref<number>(parseInt(fromBase64(props.projectId)));
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
      const data = await handleApi<VersionI[]>(() => VersionService.getAll(idParse.value), {
        errorMessage: 'Ocorreu um erro ao buscar versões.',
      });

      versions.value = data;
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
        await handleApi(() => VersionService.delete(id, idParse.value), {
          errorMessage: 'Ocorreu um erro ao remover a versão.',
          successMessage: 'Versão removida com sucesso!',
        });

        await getVersions();
      });
    }

    const setupSocketListeners = () => {
      socket.on('versionCreated', (version: VersionI) => {
        versions.value.push(version);
      });

      socket.on('versionUpdated', (updatedVersion: VersionI) => {
        const index = versions.value.findIndex((v) => v.id === updatedVersion.id);
        if (index !== -1) {
          versions.value[index] = updatedVersion;
        }
      });

      socket.on('versionDeleted', (versionId: number) => {
        versions.value = versions.value.filter((v) => v.id !== versionId);
      });
    };

    const removeSocketListeners = () => {
      socket.off('versionCreated');
      socket.off('versionUpdated');
      socket.off('versionDeleted');
    };

    onMounted(async () => {
      emitter.on('open-version-dialog', openDialog);
      await getVersions();

      socket.connect();

      socket.emit('joinProjectRoom', idParse.value);

      setupSocketListeners();
    });

    onBeforeUnmount(() => {
      emitter.off('open-version-dialog', openDialog);

      removeSocketListeners();

      socket.disconnect();
    });

    return {
      showDialog,
      getVersions,
      openDialog,
      closeDialog,
      statusFilter,
      statusOptions,
      sortFilter,
      sortOptions,
      idParse,
      versionEditId,
      removeVersion,
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
</style>
