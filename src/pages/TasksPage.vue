<template>
  <q-page padding>
    <q-dialog v-model="showTaskDialog" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <CreateTaskDialogComponent
        :version-id="versionId"
        :status-id="taskStatusId"
        :task-id="taskEditId"
        :project-id="projectId"
        @close="saveTask"
      ></CreateTaskDialogComponent>
    </q-dialog>
    <div class="row items-center justify-between q-mb-md q-gutter-md">
      <div class="col-12 col-md-auto">
        <q-breadcrumbs>
          <template v-slot:separator>
            <q-icon size="1.5em" name="mdi-chevron-right" color="primary" />
          </template>
          <q-breadcrumbs-el icon="mdi-arrow-left" @click="$router.back()" class="cursor-pointer">
            <q-tooltip>Voltar</q-tooltip>
          </q-breadcrumbs-el>
          <q-breadcrumbs-el :label="project?.name" icon="mdi-folder-outline" />
          <q-breadcrumbs-el :label="version?.name" icon="mdi-tag-outline" />
        </q-breadcrumbs>
      </div>

      <q-space v-if="!$q.screen.xs" />

      <!-- Filtro -->
      <div class="filter-group q-mb-xs">
        <span class="filter-label">Prioridade:</span>
        <q-select
          dense
          outlined
          v-model="priorityFilter"
          :options="priorityOptions"
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
        <span class="filter-label">Responsável:</span>
        <q-select
          dense
          outlined
          v-model="assigneeFilter"
          :options="assigneeOptions"
          map-options
          emit-value
          option-value="id"
          option-label="value"
          style="min-width: 180px"
          class="filter-select"
        />
      </div>
    </div>
    <KanbanBoardComponent
      :columns="distributedAndFilteredColumns"
      :project-id="projectId"
      :version-id="versionId"
      @open-task-dialog="openTaskDialog"
      @task-updated="fetchTasks"
    />
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { filterTaskPriorityEnum } from 'src/enums/filter.enum';
import { ColumnI } from 'src/models/extra.model';
import { TaskStatus, TaskStatusEnum, VersionStatusEnum } from 'src/enums/status.enum';
import { PriorityEnum } from 'src/enums/task_priority.enum';
import { clone, fromBase64 } from 'src/utils/transform';
import CreateTaskDialogComponent from 'src/components/dialogs/CreateTaskDialog.component.vue';
import ProjectService from 'src/services/project.service';
import emitter from 'src/utils/event_bus';
import KanbanBoardComponent from 'src/components/kanban/KanbanBoard.component.vue';
import { TaskI } from 'src/models/task.model';
import TaskService from 'src/services/task.service';
import VersionService from 'src/services/version.service';
import { useApi } from 'src/services/useApi';
import { ProjectI, ProjectParticipationI } from 'src/models/project.model';
import socket from 'src/services/socket.service';
import { VersionI } from 'src/models/version.model';

export default {
  props: {
    versionId: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
  },
  components: { CreateTaskDialogComponent, KanbanBoardComponent },
  setup(props) {
    const $q = useQuasar();
    const { handleApi } = useApi();

    const project = ref<ProjectI | null>(null);
    const version = ref<VersionI | null>(null);

    const priorityFilter = ref<filterTaskPriorityEnum>(filterTaskPriorityEnum.ALL);
    const priorityOptions = ref<{ id: number; value: string }[]>([
      { id: filterTaskPriorityEnum.ALL, value: 'Todas' },
      { id: filterTaskPriorityEnum.HIGH, value: 'Alta' },
      { id: filterTaskPriorityEnum.MEDIUM, value: 'Média' },
      { id: filterTaskPriorityEnum.LOW, value: 'Baixa' },
    ]);
    const assigneeFilter = ref<number>(0);
    const assigneeOptions = ref<{ id: number; value: string }[]>([{ id: 0, value: 'Todos' }]);

    const columns = ref<ColumnI[]>(
      TaskStatus.map((status) => ({
        id: status.id,
        name: status.name,
        tasks: [],
      })),
    );
    const projectId = ref<number>(parseInt(fromBase64(props.projectId)));
    const versionId = ref<number>(parseInt(fromBase64(props.versionId)));

    const showTaskDialog = ref<boolean>(false);
    const taskEditId = ref<number>(null);
    const taskStatusId = ref<TaskStatusEnum>(TaskStatusEnum.PENDING);

    const allTasks = ref<TaskI[]>([]);

    const fetchTasks = async (taskId: number | null = null, statusId: number | null = null) => {
      if (taskId && statusId) {
        const taskIndex = allTasks.value.findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          allTasks.value[taskIndex].status = statusId;
        }
      } else {
        const tasksResponse = await handleApi<TaskI[]>(() => TaskService.getAll(versionId.value), {
          errorMessage: 'Ocorreu um erro ao buscar tarefas.',
        });

        allTasks.value = tasksResponse;
      }
    };

    const distributedAndFilteredColumns = computed((): ColumnI[] => {
      const filteredTasks = allTasks.value.filter((task) => {
        const priorityMatch = (() => {
          if (priorityFilter.value === filterTaskPriorityEnum.ALL) return true;
          switch (priorityFilter.value) {
            case filterTaskPriorityEnum.HIGH:
              return task.priority === PriorityEnum.HIGH;
            case filterTaskPriorityEnum.MEDIUM:
              return task.priority === PriorityEnum.MEDIUM;
            case filterTaskPriorityEnum.LOW:
              return task.priority === PriorityEnum.LOW;
            default:
              break;
          }
        })();

        const assigneeMatch = (() => {
          if (assigneeFilter.value === 0) return true;
          return task.assignee?.id === assigneeFilter.value;
        })();

        return priorityMatch && assigneeMatch;
      });

      const newColumns: ColumnI[] = clone(columns.value);

      filteredTasks.forEach((task) => {
        const column = newColumns.find((c) => c.id === task.status);
        if (column) {
          column.tasks.push(task);
        }
      });

      return newColumns;
    });

    async function fetchUsers() {
      const data = await handleApi<ProjectParticipationI[]>(
        () => ProjectService.getMembers(projectId.value),
        {
          errorMessage: 'Ocorreu um erro ao buscar usuários.',
        },
      );

      data.forEach((u) => {
        assigneeOptions.value.push({ id: u.user.id, value: u.user.username });
      });
      assigneeFilter.value = assigneeOptions.value[0].id;
    }

    const openTaskDialog = (taskId: number | null = null, statusId: number | null = null) => {
      showTaskDialog.value = true;
      taskEditId.value = taskId ? taskId : null;
      taskStatusId.value = statusId ? statusId : TaskStatusEnum.PENDING;
    };

    const saveTask = async () => {
      await fetchTasks();
      showTaskDialog.value = false;
      taskEditId.value = null;
      taskStatusId.value = TaskStatusEnum.PENDING;
    };

    const setupSocketListeners = () => {
      socket.on('taskCreated', (task: TaskI) => {
        allTasks.value.push(task);
      });

      socket.on('taskUpdated', (updatedTask: TaskI) => {
        const index = allTasks.value.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          allTasks.value[index] = updatedTask;
        }
      });

      socket.on('taskDeleted', (taskId: number) => {
        allTasks.value = allTasks.value.filter((t) => t.id !== taskId);
      });

      socket.on('taskStatusUpdated', (updatedTask: TaskI) => {
        const index = allTasks.value.findIndex((t) => t.id === updatedTask.id);
        if (index !== -1) {
          allTasks.value[index].status = updatedTask.status;
        }
      });
    };

    const removeSocketListeners = () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
      socket.off('taskStatusUpdated');
    };

    const fetchProjectAndVersionDetails = async () => {
      const projectResponse = await handleApi<ProjectI>(
        () => ProjectService.getOne(projectId.value),
        { errorMessage: 'Erro ao buscar detalhes do projeto.' },
      );
      project.value = projectResponse;

      const versionResponse = await handleApi<VersionI>(
        () => VersionService.getOne(versionId.value, projectId.value),
        { errorMessage: 'Erro ao buscar detalhes da versão.' },
      );
      version.value = versionResponse;
    };

    onMounted(async () => {
      emitter.on('open-task-dialog', openTaskDialog);
      await fetchTasks();
      await fetchUsers();

      socket.connect();

      socket.emit('joinProjectRoom', projectId.value);

      setupSocketListeners();

      await fetchProjectAndVersionDetails();
    });

    onUnmounted(() => {
      emitter.off('open-task-dialog', openTaskDialog);

      removeSocketListeners();

      socket.disconnect();
    });

    return {
      priorityFilter,
      priorityOptions,
      assigneeFilter,
      assigneeOptions,
      distributedAndFilteredColumns,
      showTaskDialog,
      openTaskDialog,
      taskEditId,
      taskStatusId,
      projectId,
      versionId,
      saveTask,
      fetchTasks,
      project,
      version,
    };
  },
};
</script>
