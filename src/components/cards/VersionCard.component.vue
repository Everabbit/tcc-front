<template>
  <q-card flat class="version-card" @click="gotToTasks(version.id)">
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
            v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
            flat
            round
            dense
            icon="mdi-pencil"
            color="grey-7"
            @click.stop="openDialog(version.id)"
          />
          <q-btn
            v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
            flat
            round
            dense
            icon="mdi-delete"
            color="grey-7"
            @click.stop="removeVersion(version.id)"
          />
        </div>
      </div>
      <q-separator class="q-mb-sm" />
      <div v-if="version.description">
        <p class="version-description">{{ version.description }}</p>
      </div>

      <div class="version-meta flex q-gutter-sm q-mb-sm">
        <div v-if="version.startDate" class="text-caption">
          <q-icon name="mdi-calendar" size="16px" class="q-mr-sm" />
          <span>Inicio: {{ formatDate(version.startDate) }}</span>
        </div>
        <div v-if="version.endDate" class="text-caption">
          <q-icon name="mdi-calendar" size="16px" class="q-mr-sm" />
          <span>Prazo: {{ formatDate(version.endDate) }}</span>
        </div>
        <div v-if="version.githubBranch" class="text-caption">
          <q-icon name="mdi-github" size="16px" class="q-mr-sm" />
          <span>Branch: {{ version.githubBranch }}</span>
        </div>
      </div>
      <div>
        <div class="version-progress q-mb-xs">
          <span class="text-caption">Progresso:</span
          ><span class="text-caption">{{ percentTasks * 100 }}%</span>
        </div>
        <q-linear-progress rounded :value="percentTasks" color="primary" size="6px" />
      </div>
      <q-separator class="q-my-md" />
      <span class="version-footer">
        <q-icon name="mdi-format-list-checks" />
        {{ completedTasks }}/{{ totalTasks }}
        tarefas concluídas
      </span>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { RolesEnum } from 'src/enums/roles.enum';
import { TaskStatusEnum, VersionStatus, VersionStatusEnum } from 'src/enums/status.enum';
import { VersionI } from 'src/models/version.model';
import { useRolesStore } from 'src/stores/rolesStore';
import { clone, toBase64 } from 'src/utils/transform';
import { formatDate } from 'src/utils/utils';
import { PropType } from 'vue';
import { useRouter } from 'vue-router';

export default {
  props: {
    version: {
      type: Object as PropType<VersionI>,
      required: true,
    },
  },
  emits: ['open-version-dialog', 'remove-version'],
  setup(props, { emit }) {
    const $router = useRouter();
    const useRoles = useRolesStore();
    const statusValues = clone(VersionStatus);
    const completedTasks = props.version.tasks.filter(
      (X) => X.status === TaskStatusEnum.DONE,
    ).length;
    const totalTasks = props.version.tasks.length;
    const percentTasks = completedTasks && totalTasks ? completedTasks / totalTasks : 0;

    function gotToTasks(id: number) {
      const projectId = toBase64(props.version.projectId.toString());
      const versionId = toBase64(id.toString());
      $router.push(`/p/projetos/versoes/tarefas/${projectId}/${versionId}`);
    }

    function getProjectStatusName(status: VersionStatusEnum): string {
      return statusValues.find((X) => X.id === status).name;
    }

    function getProjectStatusColor(status: VersionStatusEnum): string {
      return statusValues.find((X) => X.id === status).color;
    }

    function openDialog(id: number) {
      emit('open-version-dialog', id);
    }

    function removeVersion(id: number) {
      emit('remove-version', id);
    }

    return {
      gotToTasks,
      getProjectStatusName,
      getProjectStatusColor,
      openDialog,
      removeVersion,
      formatDate,
      completedTasks,
      totalTasks,
      percentTasks,
      useRoles,
      RolesEnum,
    };
  },
};
</script>

<style lang="scss">
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
  min-height: 35px;
}

.version-description {
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
  font-size: 0.9rem;
}
</style>
