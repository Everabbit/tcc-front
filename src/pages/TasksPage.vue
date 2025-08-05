<template>
  <q-page padding>
    <q-dialog v-model="showTaskDialog">
      <CreateTaskDialogComponent
        :version-id="version.id"
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
          option-label="value"
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
              @click="openTaskDialog(task.id, task.status)"
            >
              <q-card-section>
                <div class="text-subtitle2 text-bold q-mb-sm">
                  {{ task.title }}
                </div>
                <p class="task-description text-grey-5" v-if="task.description">
                  {{ task.description }}
                </p>

                <div class="flex items-center justify-between">
                  <div class="task-dates q-mt-sm" v-if="task.deadline">
                    <q-icon name="mdi-calendar" />
                    <span class="text-caption q-ml-xs">{{
                      formatDate(new Date(task.deadline))
                    }}</span>
                  </div>
                  <div class="task-footer" v-if="task.assignee">
                    <q-avatar size="24px" color="primary" text-color="white"
                      >{{ getUsernameInitials(task.assignee.username) }}
                      <q-tooltip
                        class="bg-primary text-body2"
                        position="top"
                        anchor="bottom middle"
                        self="top middle"
                        :offset="[10, 10]"
                        >{{ task.assignee.username }}</q-tooltip
                      >
                    </q-avatar>
                  </div>
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
import TaskService from 'src/services/task.service';
import { formatDate, getUsernameInitials } from 'src/utils/utils';
import ProjectService from 'src/services/project.service';
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
  components: { draggable, CreateTaskDialogComponent },
  setup(props) {
    const $q = useQuasar();
    const viewMode = ref<string>('kanban');
    const priorityFilter = ref<filterTaskPriorityEnum>(filterTaskPriorityEnum.ALL);
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
    const assigneeOptions = ref<{ id: number; value: string }[]>([{ id: 0, value: 'Todos' }]);
    const columns = ref<ColumnI[]>(
      TaskStatus.map((status) => ({
        id: status.id,
        name: status.name,
        tasks: [],
      })),
    );
    const projectId = ref<number>(parseInt(fromBase64(props.projectId)));

    const showTaskDialog = ref<boolean>(false);
    const taskEditId = ref<number>(null);
    const taskStatusId = ref<TaskStatusEnum>(TaskStatusEnum.PENDING);

    const filteredColumns = computed((): ColumnI[] => {
      if (!priorityFilter.value && !assigneeFilter.value) {
        return columns.value;
      }

      const newColumns = JSON.parse(JSON.stringify(columns.value));

      return newColumns.map((column) => {
        column.tasks = column.tasks.filter((task) => {
          let priorityMatch = true;
          switch (priorityFilter.value) {
            case filterTaskPriorityEnum.HIGH:
              priorityMatch = task.priority === PriorityEnum.HIGH;
              break;
            case filterTaskPriorityEnum.MEDIUM:
              priorityMatch = task.priority === PriorityEnum.MEDIUM;
              break;
            case filterTaskPriorityEnum.LOW:
              priorityMatch = task.priority === PriorityEnum.LOW;
              break;
            default:
              break;
          }
          let assigneeMatch = true;
          if (assigneeFilter.value !== 0) {
            assigneeMatch = assigneeFilter.value ? task.assignee.id === assigneeFilter.value : true;
          }

          return priorityMatch && assigneeMatch;
        });
        return column;
      });
    });

    async function fetchUsers() {
      try {
        $q.loading.show();
        const response = await ProjectService.getMembers(projectId.value);

        if (!response.success) {
          throw Error(response.message);
        }
        $q.loading.hide();
        response.data.forEach((u) => {
          assigneeOptions.value.push({ id: u.user.id, value: u.user.username });
        });
        assigneeFilter.value = assigneeOptions.value[0].id;
      } catch (error) {
        $q.loading.hide();
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar usuários.',
        });
      }
    }

    const fetchData = async () => {
      $q.loading.show();
      try {
        const responseVersion: ResponseI = await VersionService.getOne(
          fromBase64(props.versionId),
          fromBase64(props.projectId),
        );

        if (!responseVersion.success) {
          throw Error(responseVersion.message);
        }

        version.value = responseVersion.data;

        const tasksResponse: ResponseI = await TaskService.getAll(version.value.id);

        if (!tasksResponse.success) {
          throw Error(tasksResponse.message);
        }

        allTasks.value = tasksResponse.data;
        distributeTasks(tasksResponse.data);
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

    const handleTaskMove = async (changeEvent, newStatusId) => {
      const { added, moved } = changeEvent;
      const eventData = added || moved;

      if (eventData) {
        const taskId = eventData.element.id;
        await TaskService.updateStatus(taskId, newStatusId);

        const task = allTasks.value.find((t) => t.id === taskId);

        if (task) {
          task.status = newStatusId;
        }
        distributeTasks(allTasks.value);

        $q.notify({
          type: 'positive',
          message: `Tarefa "${eventData.element.title}" movida!`,
          timeout: 1000,
          position: 'top',
        });
      }
    };

    const openTaskDialog = (taskId: number | null = null, statusId: number | null = null) => {
      showTaskDialog.value = true;
      taskEditId.value = taskId ? taskId : null;
      taskStatusId.value = statusId ? statusId : TaskStatusEnum.PENDING;
    };

    const saveTask = () => {
      fetchData();
      showTaskDialog.value = false;
      taskEditId.value = null;
      taskStatusId.value = TaskStatusEnum.PENDING;
    };

    const distributeTasks = (tasks: TaskI[]) => {
      columns.value.forEach((col) => (col.tasks = []));
      tasks.forEach((task) => {
        const column = columns.value.find((c) => c.id === task.status);
        if (column) {
          column.tasks.push(task);
        }
      });
    };

    const getPriorityClass = (priority: string) => {
      return `priority-${priority}`;
    };

    onMounted(() => {
      fetchData();
      fetchUsers();
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
      getUsernameInitials,
      version,
      taskEditId,
      taskStatusId,
      projectId,
      saveTask,
      formatDate,
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
  height: 83vh;
}

.kanban-column {
  background-color: $grey-2;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;

  .body--dark & {
    background-color: $grey-10;
  }

  //DIVIDINDO a quantidade de colunas pelo tamanho da tela usando o maximp flex: 0 0 calc(16.8% - 16px);
  @media (max-width: 1920px) {
    flex: 0 0 calc(16.8% - 16px);
  }

  @media (max-width: 1700px) {
    flex: 0 0 calc(24% - 16px);
  }

  @media (max-width: 1440px) {
    flex: 0 0 calc(32% - 16px);
  }

  @media (max-width: 1024px) {
    flex: 0 0 calc(48% - 16px);
  }

  @media (max-width: 768px) {
    flex: 0 0 calc(90% - 16px);
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
  overflow-y: auto;
  gap: 12px;
  min-height: 150px;
  width: 100%;
  padding-right: 8px;
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
