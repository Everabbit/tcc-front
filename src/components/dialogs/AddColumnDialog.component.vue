<template>
  <q-card class="dialog-card">
    <q-form @submit="" ref="form">
      <!-- Cabeçalho -->
      <q-card-section class="dialog-header">
        <div class="text-h6">Adicionar Coluna</div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Conteúdo -->
      <q-card-section class="dialog-content">
        <!-- Formulario -->
        <q-input
          outlined
          v-model="columnData.name"
          label="Nome da Coluna *"
          :rules="[required('Nome da Coluna')]"
          hide-bottom-space
          class="q-mb-md"
        />

        <q-color v-model="columnData.color" class="q-mb-md" />
        
      </q-card-section>

      <!-- Rodapé -->
      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn label="Adicionar Coluna" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { QForm } from 'quasar';
import { TaskStatusEnum } from 'src/enums/status.enum';
import { TaskColumnI } from 'src/models/task_columns.model';
import { required } from 'src/utils/validation';
import { ref } from 'vue';

export default {
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],
  setup(props) {
    const form = ref<QForm>(null);
    const columnData = ref<TaskColumnI>({
      name: '',
      projectId: props.projectId,
      color: 'primary',
      id: 0,
      type: TaskStatusEnum.IN_PROGRESS
    });

    return {
      required, columnData
    }
  }
}
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 800px;
  min-width: 0;
  color: var(--text-color);
  box-sizing: border-box;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding: 15px 20px;
  flex-wrap: wrap;
}

.dialog-content {
  padding: 20px;
  overflow: auto;
}

.dialog-footer {
  border-top: 1px solid #333;
  padding: 15px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 768px) {
  .dialog-header,
  .dialog-content,
  .dialog-footer {
    padding: 12px 15px;
  }
}

@media (max-width: 480px) {
  .dialog-header {
    align-items: flex-start;
    gap: 10px;
  }

  .dialog-header,
  .dialog-content,
  .dialog-footer {
    padding: 10px 12px;
  }
}
</style>