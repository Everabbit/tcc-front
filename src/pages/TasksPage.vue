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
    <div class="row items-center justify-between q-mb-md">
      <!-- Botão de voltar -->
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
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
import { ref, onMounted, computed, onBeforeMount } from 'vue';
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
import { useApi } from 'src/services/useApi';
import { ProjectParticipationI } from 'src/models/project.model';

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

    const fetchTasks = async () => {
      const data = await handleApi<TaskI[]>(() => TaskService.getAll(versionId.value), {
        errorMessage: 'Ocorreu um erro ao buscar tarefas.',
      });

      allTasks.value = data;
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

    onMounted(async () => {
      emitter.on('open-task-dialog', openTaskDialog);
      await fetchTasks();
      await fetchUsers();
    });

    onBeforeMount(() => {
      emitter.off('open-task-dialog', openTaskDialog);
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
    };
  },
};
</script>
