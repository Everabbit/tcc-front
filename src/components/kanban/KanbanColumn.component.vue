<template>
  <div class="kanban-column">
    <div class="column-header">
      <span class="text-subtitle1 text-bold">{{ column.name }}</span>
      <q-badge color="primary" class="text-bold">{{ column.tasks.length }}</q-badge>
    </div>

    <draggable
      class="column-content"
      v-model="column.tasks"
      group="tasks"
      item-key="id"
      @change="(event) => handleTaskMove(event, column.id)"
    >
      <template #item="{ element: task }">
        <KanbanCardComponent :task="task" @open-task-dialog="openTaskDialog" />
      </template>
    </draggable>

    <q-btn
      v-if="useRoles.hasPermission(RolesEnum.DEVELOPER)"
      color="primary"
      icon="mdi-plus"
      label="Adicionar Tarefa"
      class="full-width q-mt-md"
      @click="openTaskDialog(null, column.id)"
    />
  </div>
</template>

<script lang="ts">
import { ColumnI } from 'src/models/extra.model';
import { PropType } from 'vue';
import KanbanCardComponent from './KanbanCard.component.vue';
import draggable from 'vuedraggable';
import { useRolesStore } from 'src/stores/rolesStore';
import { RolesEnum } from 'src/enums/roles.enum';

export default {
  props: {
    column: {
      type: Object as PropType<ColumnI>,
      required: true,
    },
  },
  emits: ['task-move', 'open-task-dialog'],
  components: { draggable, KanbanCardComponent },
  setup(props, { emit }) {
    const useRoles = useRolesStore();

    const handleTaskMove = async (changeEvent, newStatusId) => {
      emit('task-move', changeEvent, newStatusId);
    };

    const openTaskDialog = (taskId: number | null = null, statusId: number | null = null) => {
      emit('open-task-dialog', taskId, statusId);
    };

    return {
      handleTaskMove,
      openTaskDialog,
      useRoles,
      RolesEnum,
    };
  },
};
</script>

<style lang="scss" scoped>
.kanban-column {
  background-color: $grey-1;
  border: 1px solid;
  border-color: $grey-4;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;

  .body--dark & {
    background-color: $grey-10;
    border: 0px solid;
  }

  @media (max-width: 1920px) {
    flex: 0 0 calc(20% - 16px);
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
</style>
