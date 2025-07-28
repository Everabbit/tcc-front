<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div>
        <q-btn flat round icon="arrow_back" @click="$router.back()" />
        <q-btn-toggle
          v-model="viewMode"
          toggle-color="primary"
          :options="[
            { label: 'Kanban', value: 'kanban', icon: 'mdi-view-column' },
            { label: 'Lista', value: 'list', icon: 'mdi-view-list' },
          ]"
        />
      </div>

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
        <span class="filter-label">Responsável:</span>
        <q-select
          dense
          outlined
          v-model="assigneeFilter"
          :options="assigneeOptions"
          map-options
          emit-value
          option-value="id"
          option-label="username"
          style="min-width: 180px"
          class="filter-select"
        />
      </div>
    </div>
    <div class="kanban-board">
      <div v-for="column in filteredColumns" :key="column.id" class="kanban-column">
        <div class="column-header">
          <span class="text-subtitle1 text-bold">{{ column.name }}</span>
          <q-badge color="grey-8" class="text-bold">{{ column.tasks.length }}</q-badge>
        </div>

        <draggable
          class="column-content"
          v-model="column.tasks"
          group="tasks"
          item-key="id"
          @change="(event) => handleTaskMove(event, column.id)"
        >
          <template #item="{ element: task }">
            <q-card
              class="task-card"
              flat
              :class="getPriorityClass(task.priority)"
              @click="openTaskDialog(task)"
            >
              <q-card-section>
                <div class="text-subtitle2 text-bold q-mb-sm">
                  {{ task.title }}
                </div>
                <p class="task-description text-grey-5">
                  {{ task.description }}
                </p>

                <div class="task-footer">
                  <q-avatar size="24px" color="primary" text-color="white" class="q-mr-sm">{{
                    getInitials(task.assignee.name)
                  }}</q-avatar>
                  <span class="text-caption">{{ task.assignee.name }}</span>
                </div>
                <div class="task-dates q-mt-sm">
                  <q-icon name="mdi-calendar" />
                  <span class="text-caption q-ml-xs">{{ task.dueDate }}</span>
                </div>
              </q-card-section>
            </q-card>
          </template>
        </draggable>

        <q-btn
          outline
          color="grey"
          icon="mdi-plus"
          label="Adicionar Tarefa"
          class="full-width q-mt-md"
          @click="openTaskDialog(null, column.id)"
        />
      </div>
    </div>

    <q-dialog v-model="showTaskDialog">
      <CreateTaskDialogComponent :version-id="version.id"></CreateTaskDialogComponent>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import draggable from 'vuedraggable';
import { filterTaskPriorityEnum } from 'src/enums/filter.enum';
import { UserBasicI } from 'src/models/user.model';
import { ColumnI } from 'src/models/extra.model';
import { TaskStatus, TaskStatusEnum, VersionStatusEnum } from 'src/enums/status.enum';
import { TaskI } from 'src/models/task.model';
import { PriorityEnum } from 'src/enums/task_priority.enum';
import { VersionI } from 'src/models/version.model';
import VersionService from 'src/services/version.service';
import { fromBase64 } from 'src/utils/transform';
import { ResponseI } from 'src/models/response.model';
import CreateTaskDialogComponent from 'src/components/dialogs/CreateTaskDialog.component.vue';

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
  components: { draggable, CreateTaskDialogComponent },
  setup(props) {
    const $q = useQuasar();
    const viewMode = ref<string>('kanban');
    const priorityFilter = ref<number>(1);
    const version = ref<VersionI>({
      projectId: 0,
      project: undefined,
      name: '',
      status: VersionStatusEnum.DRAFT,
      startDate: undefined,
    });
    const priorityOptions = ref<{ id: number; value: string }[]>([
      { id: filterTaskPriorityEnum.ALL, value: 'Todas' },
      { id: filterTaskPriorityEnum.HIGH, value: 'Alta' },
      { id: filterTaskPriorityEnum.MEDIUM, value: 'Média' },
      { id: filterTaskPriorityEnum.LOW, value: 'Baixa' },
    ]);
    const allTasks = ref<TaskI[]>([]);
    const assigneeFilter = ref<number>(0);
    const assigneeOptions = ref<UserBasicI[]>([]);
    const columns = ref<ColumnI[]>(
      TaskStatus.map((status) => ({
        id: status.id,
        name: status.name,
        tasks: [],
      })),
    );

    const showTaskDialog = ref<boolean>(false);
    const taskEditId = ref<string>(null);

    const filteredColumns = computed(() => {
      if (!priorityFilter.value && !assigneeFilter.value) {
        return columns.value;
      }

      const newColumns = JSON.parse(JSON.stringify(columns.value));

      return newColumns.map((column) => {
        column.tasks = column.tasks.filter((task) => {
          const priorityMatch = priorityFilter.value
            ? task.priority === priorityFilter.value
            : true;
          const assigneeMatch = assigneeFilter.value
            ? task.assignee.id === assigneeFilter.value
            : true;
          return priorityMatch && assigneeMatch;
        });
        return column;
      });
    });

    const fetchData = async () => {
      $q.loading.show();
      try {
        // Aqui você chamaria seus serviços para buscar dados da versão e tarefas
        // Ex: const tasksResponse = await TaskService.getByVersion(props.versionId);

        const responseVersion: ResponseI = await VersionService.getOne(
          fromBase64(props.versionId),
          fromBase64(props.projectId),
        );

        if (!responseVersion.success) {
          throw Error(responseVersion.message);
        }

        version.value = responseVersion.data;

        const tasksResponse: TaskI[] = [];

        allTasks.value = tasksResponse;
        distributeTasks(tasksResponse);

        // Preencher opções de filtro de responsáveis
        const assignees = tasksResponse.map((t) => t.assignee);
        const uniqueAssignees = Array.from(
          new Map(assignees.map((item) => [item['id'], item])).values(),
        );
        $q.loading.hide();
      } catch (error) {
        $q.loading.hide();
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar tarefas.',
        });
      }
    };

    const handleTaskMove = (changeEvent, newStatusId) => {
      const { added, moved } = changeEvent;
      const eventData = added || moved;

      if (eventData) {
        const taskId = eventData.element.id;
        // Lógica para persistir a mudança no backend
        console.log(`Tarefa ${taskId} movida para a coluna ${newStatusId}`);
        // Ex: await TaskService.updateStatus(taskId, newStatusId);

        // Atualiza o statusId no objeto da tarefa localmente
        const task = allTasks.value.find((t) => t.id === taskId);
        if (task) {
          task.status = newStatusId;
        }

        $q.notify({
          type: 'positive',
          message: `Tarefa "${eventData.element.title}" movida!`,
          timeout: 1000,
          position: 'top',
        });
      }
    };

    const openTaskDialog = (task: TaskI | null = null, statusId: number | null = null) => {
      showTaskDialog.value = true;
    };

    const distributeTasks = (tasks: TaskI[]) => {
      columns.value.forEach((col) => (col.tasks = [])); // Limpa as colunas
      tasks.forEach((task) => {
        const column = columns.value.find((c) => c.id === task.status);
        if (column) {
          column.tasks.push(task);
        }
      });
    };

    const getInitials = (name: string = '') => {
      if (!name) return '??';
      const names = name.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const getPriorityClass = (priority: string) => {
      return `priority-${priority}`;
    };

    onMounted(() => {
      fetchData();
    });

    return {
      draggable,
      viewMode,
      priorityFilter,
      priorityOptions,
      assigneeFilter,
      assigneeOptions,
      filteredColumns,
      showTaskDialog,
      handleTaskMove,
      getPriorityClass,
      openTaskDialog,
      getInitials,
      version,
    };
  },
};
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: 84vh;
}

.kanban-column {
  flex: 0 0 calc(20% - 16px);
  background-color: $grey-2;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;

  .body--dark & {
    background-color: $grey-10;
  }
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid $grey-4;
  margin-bottom: 12px;

  .body--dark & {
    border-bottom: 1px solid $grey-9;
  }
}

.column-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 150px;
}

.task-card {
  cursor: grab;
  border-left: 5px solid transparent;
  transition:
    background-color 0.3s,
    box-shadow 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .task-description {
    font-size: 0.85em;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .task-footer,
  .task-dates {
    display: flex;
    align-items: center;
  }
}

// Indicadores de Prioridade
.priority-0 {
  border-left-color: $green-6;
}
.priority-1 {
  border-left-color: $orange-6;
}
.priority-2 {
  border-left-color: $red-6;
}
.priority-3 {
  border-left-color: $purple-6;
}
</style>
