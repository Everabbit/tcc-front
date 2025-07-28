<template>
  <q-card class="dialog-card">
    <q-form ref="formRef" @submit="onSave">
      <q-card-section class="dialog-header">
        <div class="text-h6">
          {{ isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa' }}
        </div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="dialog-content">
        <q-input
          label="Título da Tarefa *"
          v-model="editedTask.title"
          autofocus
          outlined
          class="q-mb-md"
          :rules="[required('Título')]"
          hide-bottom-space
        />

        <q-input
          label="Descrição (Opcional)"
          v-model="editedTask.description"
          outlined
          type="textarea"
          rows="3"
          class="q-mb-md"
        />

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6">
            <q-select
              label="Status *"
              v-model="editedTask.status"
              :options="statusOptions"
              outlined
              emit-value
              map-options
              :rules="[required('Status')]"
              hide-bottom-space
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-select
              label="Prioridade"
              v-model="editedTask.priority"
              :options="priorityOptions"
              outlined
              emit-value
              map-options
            />
          </div>
        </div>

        <div class="q-mb-md">
          <q-input
            label="Prazo da Tarefa"
            v-model="deadlineFormatted"
            readonly
            outlined
            mask="##/##/####"
          >
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="editedTask.deadline" mask="YYYY-MM-DD" minimal color="primary">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="OK" color="primary" flat v-close-popup />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <q-select
          label="Responsável (Opcional)"
          v-model="editedTask.assigneeId"
          :options="assigneeOptions"
          outlined
          emit-value
          map-options
          clearable
          use-input
          @filter="filterAssignee"
          class="q-mb-md"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-account-star-outline" />
          </template>
        </q-select>

        <div class="q-mb-md">
          <label class="text-caption">Anexos (Opcional)</label>
          <q-file
            outlined
            v-model="files"
            accept=".jpg, .jpeg, .png, .pdf, .zip"
            class="q-mt-xs"
            label="Clique para escolher os arquivos"
            multiple
            counter
            use-chips
          >
            <template v-slot:prepend>
              <q-icon name="mdi-paperclip" />
            </template>
          </q-file>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn
          :label="isEditing ? 'Salvar Alterações' : 'Criar Tarefa'"
          color="primary"
          type="submit"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { ref, onMounted, computed, defineComponent } from 'vue';
import { QForm, useQuasar } from 'quasar';
import { required } from 'src/utils/validation'; // Supondo que você tenha este utilitário
import { TaskI } from 'src/models/task.model';
import { TaskStatus, TaskStatusEnum } from 'src/enums/status.enum';
import { PriorityEnum } from 'src/enums/task_priority.enum';
import { UserBasicI } from 'src/models/user.model';

export default defineComponent({
  name: 'CreateTaskDialog',
  props: {
    task: {
      type: Object as () => TaskI,
      default: null,
    },
    statusId: {
      type: Number as () => TaskStatusEnum,
      default: TaskStatusEnum.PENDING,
    },
    versionId: {
      type: Number,
      required: true,
    },
  },
  emits: ['save'],

  setup(props, { emit }) {
    const $q = useQuasar();
    const formRef = ref<QForm | null>(null);
    const isEditing = computed(() => !!props.task);

    const defaultTask: TaskI = {
      id: null,
      title: '',
      description: '',
      status: props.statusId,
      priority: PriorityEnum.MEDIUM,
      assigneeId: null,
      deadline: null,
      versionId: props.versionId,
    };

    const editedTask = ref<TaskI>({ ...(props.task || defaultTask) });
    const files = ref<File[]>([]);

    // --- Opções e Filtros (Simulação de dados) ---
    const allAssignees = ref<UserBasicI[]>([]);
    const assigneeOptions = ref<any[]>([]);

    const statusOptions = ref<{ label: string; value: TaskStatusEnum }[]>(
      TaskStatus.map((status) => ({
        label: status.name,
        value: status.id,
      })),
    );

    const priorityOptions = [
      { label: 'Baixa', value: PriorityEnum.LOW },
      { label: 'Média', value: PriorityEnum.MEDIUM },
      { label: 'Alta', value: PriorityEnum.HIGH },
    ];

    async function fetchUsers() {
      // Simula a chamada a um UserService.getBasicUserList()
      allAssignees.value = [
        { id: 1, username: 'john.doe' },
        { id: 2, username: 'jane.smith' },
        { id: 3, username: 'carlos.silva' },
      ];
      assigneeOptions.value = allAssignees.value.map((u) => ({
        label: u.username,
        value: u.id,
      }));
    }

    function filterAssignee(val: string, update: (callbackFn: () => void) => void) {
      if (val === '') {
        update(() => {
          assigneeOptions.value = allAssignees.value.map((u) => ({
            label: u.username,
            value: u.id,
          }));
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        assigneeOptions.value = allAssignees.value
          .filter((v) => v.username.toLowerCase().indexOf(needle) > -1)
          .map((u) => ({ label: u.username, value: u.id }));
      });
    }

    // --- Lógica de Data ---
    const deadlineFormatted = computed({
      get: () => {
        if (!editedTask.value.deadline) return '';
        const [year, month, day] = editedTask.value.deadline.split('-');
        return `${day}/${month}/${year}`;
      },
      set: (val) => {
        if (!val || val.length < 10) {
          editedTask.value.deadline = null;
        } else {
          const [day, month, year] = val.split('/');
          if (day && month && year) {
            editedTask.value.deadline = `${year}-${month}-${day}`;
          }
        }
      },
    });

    // --- Submissão do Formulário ---
    async function onSave() {
      const isValid = await formRef.value?.validate();
      if (!isValid) {
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
        return;
      }

      $q.loading.show({ message: 'Salvando...' });

      // Cria o FormData para enviar ao backend
      const formData = new FormData();
      formData.append('task', JSON.stringify(editedTask.value));
      if (files.value.length > 0) {
        files.value.forEach((file) => formData.append('attachments', file));
      }

      try {
        // Exemplo: const response = await TaskService.save(formData);
        console.log('Dados a serem enviados:', editedTask.value);
        console.log('Arquivos:', files.value);

        // Simulando sucesso
        await new Promise((resolve) => setTimeout(resolve, 1000));

        emit('save'); // Avisa o componente pai para recarregar a lista

        $q.notify({
          type: 'positive',
          message: `Tarefa ${isEditing.value ? 'atualizada' : 'criada'} com sucesso!`,
        });
      } catch (error) {
        $q.notify({ type: 'negative', message: 'Falha ao salvar a tarefa.' });
      } finally {
        $q.loading.hide();
      }
    }

    onMounted(() => {
      fetchUsers();
    });

    return {
      formRef,
      editedTask,
      isEditing,
      files,
      statusOptions,
      priorityOptions,
      assigneeOptions,
      deadlineFormatted,
      onSave,
      required,
      filterAssignee,
    };
  },
});
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
