<template>
  <div class="kanban-board">
    <KanbanColumnComponent
      v-for="column in columns"
      :key="column.id"
      :column="column"
      @task-move="handleTaskMove"
      @open-task-dialog="openTaskDialog"
    />
  </div>
</template>
<script lang="ts">
import { PropType } from 'vue';
import { ColumnI } from 'src/models/extra.model';
import KanbanColumnComponent from './KanbanColumn.component.vue';
import TaskService from 'src/services/task.service';
import { useQuasar } from 'quasar';
import { useApi } from 'src/services/useApi';

export default {
  props: {
    columns: {
      type: Array as PropType<ColumnI[]>,
      required: true,
    },
  },
  emits: ['open-task-dialog', 'task-updated'],
  components: { KanbanColumnComponent },
  setup(props, { emit }) {
    const $q = useQuasar();
    const { handleApi } = useApi();

    const handleTaskMove = async (changeEvent, newStatusId) => {
      const { added, moved } = changeEvent;
      const eventData = added || moved;

      if (eventData) {
        const task = eventData.element;
        const taskId = task.id;

        // Apenas faz a chamada de API e avisa o pai que algo mudou
        const data = await handleApi(() => TaskService.updateStatus(taskId, newStatusId), {
          successMessage: `Tarefa "${eventData.element.title}" movida!`,
          errorMessage: 'Ocorreu um erro ao mover a tarefa.',
        });

        if (data) {
          emit('task-updated', taskId, newStatusId);
        }
      }
    };

    const openTaskDialog = (taskId: number | null = null, statusId: number | null = null) => {
      emit('open-task-dialog', taskId, statusId);
    };

    return { handleTaskMove, openTaskDialog };
  },
};
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  height: 83vh;
}
</style>
