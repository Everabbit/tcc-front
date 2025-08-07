<template>
  <q-card
    class="task-card"
    flat
    :class="getPriorityClass(task.priority)"
    @click="openTaskDialog(task.id, task.status)"
  >
    <q-card-section class="q-pt-sm">
      <div class="text-subtitle2 text-bold q-mb-sm">
        {{ task.title }}
      </div>
      <p class="task-description text-grey-5 q-my-none" v-if="task.description">
        {{ task.description }}
      </p>
      <div class="q-my-none">
        <q-badge
          v-if="task.tags"
          v-for="tag in task.tags"
          :key="tag.id"
          :style="`background-color: ${tag.tag.color}`"
          class="q-mr-sm"
          rounded
        >
          <q-tooltip
            class="text-body2"
            position="top"
            anchor="bottom middle"
            self="top middle"
            :offset="[10, 10]"
            :style="`background-color: ${tag.tag.color}; color: ${getContrastColor(tag.tag.color)}`"
            >{{ tag.tag.name }}</q-tooltip
          >
        </q-badge>
      </div>
      <div class="flex items-center justify-between">
        <div class="task-dates q-mt-sm" v-if="task.deadline">
          <q-icon name="mdi-calendar" />
          <span class="text-caption q-ml-xs">{{ formatDate(new Date(task.deadline)) }}</span>
        </div>
        <q-space v-else />
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

<script lang="ts">
import { TaskI } from 'src/models/task.model';
import { PriorityEnum } from 'src/enums/task_priority.enum';
import { formatDate, getContrastColor, getUsernameInitials } from 'src/utils/utils';
import { PropType } from 'vue';

export default {
  props: {
    task: {
      type: Object as PropType<TaskI>,
      required: true,
    },
  },
  emits: ['open-task-dialog'],
  setup(props, { emit }) {
    const getPriorityClass = (priority: PriorityEnum) => {
      return `priority-${priority}`;
    };

    const openTaskDialog = (taskId: number | null = null, statusId: number | null = null) => {
      emit('open-task-dialog', taskId, statusId);
    };

    return {
      getPriorityClass,
      openTaskDialog,
      formatDate,
      getUsernameInitials,
      getContrastColor,
    };
  },
};
</script>

<style lang="scss">
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
