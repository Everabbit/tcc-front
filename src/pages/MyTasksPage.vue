<template>
  <q-page padding>
    <q-dialog v-model="showTaskDialog">
      <CreateTaskDialogComponent
        :status-id="taskStatusId"
        :task-id="taskEditId"
        @close="saveTask"
      ></CreateTaskDialogComponent>
    </q-dialog>
    <div class="row items-center justify-between q-mb-md">
      <!-- Filtro -->
      <q-space />
      <div class="filter-group">
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
    </div>
    <KanbanBoardComponent
      :columns="distributedAndFilteredColumns"
      @open-task-dialog="openTaskDialog"
      @task-updated="fetchTasks"
    />
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { TaskStatus, TaskStatusEnum } from 'src/enums/status.enum';
import { ColumnI } from 'src/models/extra.model';
import { TaskI } from 'src/models/task.model';
import emitter from 'src/utils/event_bus';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import CreateTaskDialogComponent from 'src/components/dialogs/CreateTaskDialog.component.vue';
import KanbanBoardComponent from 'src/components/kanban/KanbanBoard.component.vue';
import { filterTaskPriorityEnum } from 'src/enums/filter.enum';
import { PriorityEnum } from 'src/enums/task_priority.enum';
import TaskService from 'src/services/task.service';
import { clone } from 'src/utils/transform';
import { useApi } from 'src/services/useApi';

export default {
  components: { CreateTaskDialogComponent, KanbanBoardComponent },
  setup() {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const columns = ref<ColumnI[]>(
      TaskStatus.map((status) => ({
        id: status.id,
        name: status.name,
        tasks: [],
      })),
    );
    const allTasks = ref<TaskI[]>([]);
    const showTaskDialog = ref<boolean>(false);
    const taskEditId = ref<number>(null);
    const taskStatusId = ref<TaskStatusEnum>(TaskStatusEnum.PENDING);

    const priorityFilter = ref<filterTaskPriorityEnum>(filterTaskPriorityEnum.ALL);
    const priorityOptions = ref<{ id: number; value: string }[]>([
      { id: filterTaskPriorityEnum.ALL, value: 'Todas' },
      { id: filterTaskPriorityEnum.HIGH, value: 'Alta' },
      { id: filterTaskPriorityEnum.MEDIUM, value: 'Média' },
      { id: filterTaskPriorityEnum.LOW, value: 'Baixa' },
    ]);

    const fetchTasks = async () => {
      const tasksResponse = await handleApi<TaskI[]>(() => TaskService.getAll(), {
        errorMessage: 'Ocorreu um erro ao buscar tarefas.',
      });

      allTasks.value = tasksResponse;
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

        return priorityMatch;
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

    const openTaskDialog = (taskId: number | null = null, statusId: number | null = null) => {
      showTaskDialog.value = true;
      taskEditId.value = taskId ? taskId : null;
      taskStatusId.value = statusId ? statusId : TaskStatusEnum.PENDING;
    };

    const saveTask = () => {
      emitter.emit('update-tasks');
      showTaskDialog.value = false;
      taskEditId.value = null;
      taskStatusId.value = TaskStatusEnum.PENDING;
    };

    onMounted(async () => {
      await fetchTasks();
      emitter.on('open-task-dialog', openTaskDialog);
      emitter.emit('update-tasks');
    });

    onBeforeMount(() => {
      emitter.off('open-task-dialog', openTaskDialog);
    });
    return {
      openTaskDialog,
      saveTask,
      showTaskDialog,
      taskStatusId,
      taskEditId,
      priorityFilter,
      priorityOptions,
      allTasks,
      fetchTasks,
      distributedAndFilteredColumns,
    };
  },
};
</script>
