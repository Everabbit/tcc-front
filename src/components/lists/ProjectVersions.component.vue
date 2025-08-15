<template>
  <q-card class="q-mb-md card-project">
    <q-dialog v-model="showDialogVersion" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <CreateVersionDialog
        @close="createVersion"
        :project-id="projectId"
        :version-id="versionEditId"
        v-if="showDialogVersion"
      ></CreateVersionDialog>
    </q-dialog>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6">Versões</div>
        <div>
          <q-btn
            color="primary"
            icon="mdi-diversify"
            label="Ver versões"
            flat
            @click="toVersions(projectId)"
          />
          <q-btn
            v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
            color="primary"
            icon="mdi-plus"
            :label="$q.screen.xs ? '' : 'Nova Versão'"
            flat
            @click="createVersion()"
          />
        </div>
      </div>
      <q-separator />

      <q-markup-table flat class="q-mt-md">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Status</th>
            <th>Criação</th>
            <th>Progresso</th>
            <th class="text-right" v-if="useRoles.hasPermission(RolesEnum.MANAGER)">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="version in versions"
            :key="version.id"
            v-on:click="gotToTasks(version.id)"
            style="cursor: pointer"
          >
            <td>
              <div class="text-center">{{ version.name }}</div>
            </td>
            <td>
              <div class="text-center">
                <q-badge
                  :color="versionStatus.find((status) => status.id === version.status).color"
                  >{{ versionStatus.find((status) => status.id === version.status).name }}</q-badge
                >
              </div>
            </td>
            <td>
              <div class="text-center">{{ formatDate(version.createdAt) }}</div>
            </td>
            <td>
              <div class="text-center">
                <span> {{ getFixedProgress(getPercentVersionTasks(version.id)) }}% </span>
              </div>
              <q-linear-progress :value="getPercentVersionTasks(version.id)" color="primary" />
            </td>
            <td class="text-right" v-if="useRoles.hasPermission(RolesEnum.MANAGER)">
              <q-btn flat dense icon="mdi-pencil" @click.stop="createVersion(version.id)" />
              <q-btn flat dense icon="mdi-delete" @click.stop="removeVersion(version.id)" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import CreateVersionDialog from 'src/components/dialogs/CreateVersionDialog.component.vue';
import { RolesEnum } from 'src/enums/roles.enum';
import { TaskStatusEnum, VersionStatus } from 'src/enums/status.enum';
import { VersionI } from 'src/models/version.model';
import socket from 'src/services/socket.service';
import { useApi } from 'src/services/useApi';
import VersionService from 'src/services/version.service';
import { useRolesStore } from 'src/stores/rolesStore';
import { clone, toBase64 } from 'src/utils/transform';
import { formatDate } from 'src/utils/utils';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
export default {
  components: {
    CreateVersionDialog,
  },
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const $router = useRouter();
    const { handleApi } = useApi();
    const useRoles = useRolesStore();
    const showDialogVersion = ref<boolean>(false);
    const versionStatus = clone(VersionStatus);
    const versionEditId = ref<string>(null);

    const versions = ref<VersionI[]>([]);

    async function getVersions(): Promise<void> {
      const versionsResponse = await handleApi<VersionI[]>(
        () => VersionService.getAll(props.projectId),
        {
          errorMessage: 'Ocorreu um erro ao buscar versões.',
        },
      );
      versions.value.splice(0, versions.value.length, ...versionsResponse);
    }

    async function createVersion(id: number | null = null): Promise<void> {
      if (id) {
        versionEditId.value = toBase64(id.toString());
      } else {
        versionEditId.value = null;
      }
      showDialogVersion.value = !showDialogVersion.value;
      if (showDialogVersion.value === false) {
        await getVersions();
      }
    }

    function toVersions(id: number) {
      $router.push('/p/projetos/versoes/' + toBase64(id.toString()));
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
        await handleApi(() => VersionService.delete(id, props.projectId), {
          errorMessage: 'Ocorreu um erro ao remover a versão.',
          successMessage: 'Versão removida com sucesso!',
        });

        await getVersions();
      });
    }

    function gotToTasks(id: number) {
      const projectId = toBase64(props.projectId.toString());
      const versionId = toBase64(id.toString());
      $router.push(`/p/projetos/versoes/tarefas/${projectId}/${versionId}`);
    }

    function getTotalVersionTasks(versionId: number): number {
      const version = versions.value.find((v) => v.id === versionId);
      if (!version) {
        return 0;
      }
      return version.tasks.length;
    }

    function getCompletedVersionTasks(versionId: number): number {
      const version = versions.value.find((v) => v.id === versionId);
      if (!version) {
        return 0;
      }
      return version.tasks.filter((task) => task.status === TaskStatusEnum.DONE).length;
    }

    function getPercentVersionTasks(versionId: number): number {
      const completed = getCompletedVersionTasks(versionId);
      const total = getTotalVersionTasks(versionId);
      return total > 0 ? completed / total : 0;
    }

    function getFixedProgress(progress): string {
      const prog = progress * 100;
      if (Number.isInteger(progress)) {
        return prog.toFixed(0);
      }
      return prog.toFixed(2);
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
      await getVersions();

      socket.connect();

      socket.emit('joinProjectRoom', props.projectId);

      setupSocketListeners();
    });

    onUnmounted(() => {
      removeSocketListeners();

      socket.disconnect();
    });

    return {
      showDialogVersion,
      createVersion,
      versionStatus,
      versionEditId,
      toVersions,
      removeVersion,
      gotToTasks,
      getTotalVersionTasks,
      getCompletedVersionTasks,
      getPercentVersionTasks,
      useRoles,
      RolesEnum,
      versions,
      formatDate,
      getFixedProgress,
    };
  },
};
</script>
