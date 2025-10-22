<template>
  <q-card class="history-dialog-card">
    <q-card-section class="dialog-header">
      <div class="text-h6">Histórico da Tarefa</div>
      <q-btn icon="mdi-close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-md" style="max-height: 60vh; overflow-y: auto">
      <div v-if="loading" class="text-center q-pa-md">
        <q-spinner-dots color="primary" size="40px" />
      </div>
      <div v-else-if="!history.length" class="text-center text-grey q-pa-md">
        Nenhum histórico de alterações encontrado para esta tarefa.
      </div>
      <q-timeline color="primary" v-else>
        <q-timeline-entry
          v-for="entry in history"
          :key="entry.id"
          :subtitle="formatDateHour(entry.changedAt)"
          :icon="getIconForField(entry.field)"
        >
          <template v-slot:title>
            <span class="text-weight-bold">{{ entry.user?.username }}</span>
            alterou o campo
            <span class="text-weight-bold">{{ getFieldName(entry.field) }}</span>
          </template>
          <div>
            <q-badge outline color="grey-7" :label="`De: ${entry.oldValue || 'vazio'}`" />
            <q-icon name="mdi-arrow-right-thin" class="q-mx-sm" />
            <q-badge outline color="primary" :label="`Para: ${entry.newValue || 'vazio'}`" />
          </div>
        </q-timeline-entry>
      </q-timeline>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right" class="dialog-footer">
      <q-btn label="Fechar" color="primary" flat v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { TaskHistoryI } from 'src/models/task_history.model';
import TaskService from 'src/services/task.service';
import { useApi } from 'src/services/useApi';
import { formatDate } from 'src/utils/utils';

export default defineComponent({
  name: 'TaskHistoryDialog',
  props: {
    taskId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const { handleApi } = useApi();
    const history = ref<TaskHistoryI[]>([]);
    const loading = ref(false);

    const fieldMap = {
      title: { name: 'Título', icon: 'mdi-format-title' },
      description: { name: 'Descrição', icon: 'mdi-card-text-outline' },
      status: { name: 'Status', icon: 'mdi-list-status' },
      priority: { name: 'Prioridade', icon: 'mdi-priority-high' },
      assigneeId: { name: 'Responsável', icon: 'mdi-account-star-outline' },
      deadline: { name: 'Prazo', icon: 'mdi-calendar-clock' },
      versionId: { name: 'Versão', icon: 'mdi-tag-outline' },
    };

    const getFieldName = (field: string) => fieldMap[field]?.name || field;
    const getIconForField = (field: string) => fieldMap[field]?.icon || 'mdi-help-circle-outline';

    const fetchHistory = async () => {
      loading.value = true;
      const response = await handleApi<TaskHistoryI[]>(
        () => TaskService.getTaskHistory(props.taskId),
        {
          errorMessage: 'Erro ao buscar histórico da tarefa.',
        },
      );
      if (response) {
        history.value = response;
      }
      loading.value = false;
    };

    onMounted(fetchHistory);

    const formatDateHour = (date: string | Date) => {
      const d = new Date(date);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return {
      history,
      loading,
      formatDateHour,
      getFieldName,
      getIconForField,
    };
  },
});
</script>

<style scoped>
.history-dialog-card {
  width: 100%;
  max-width: 700px;
}
.dialog-header,
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
