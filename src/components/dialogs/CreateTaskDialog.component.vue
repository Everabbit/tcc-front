<template>
  <q-card class="task-dialog-card">
    <q-dialog v-model="showHistoryDialog">
      <TaskHistoryDialog :task-id="editedTask.id" />
    </q-dialog>

    <q-form ref="formRef" @submit="onSave">
      <q-card-section class="dialog-header">
        <div class="text-h6">
          <q-icon name="mdi-format-list-bulleted-square" class="q-mr-sm" />
          {{ getTitle() }}
        </div>
        <div>
          <q-btn
            v-if="isEditing"
            icon="mdi-history"
            flat
            round
            dense
            @click="showHistoryDialog = true"
          >
            <q-tooltip>Ver Histórico</q-tooltip>
          </q-btn>
          <q-btn icon="mdi-close" flat round dense v-close-popup />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-x-lg q-col-gutter-y-md">
          <div class="col-12 col-md-7">
            <q-input
              :readonly="!rolesStore.hasPermission(RolesEnum.DEVELOPER)"
              label="Título da Tarefa *"
              v-model="editedTask.title"
              autofocus
              outlined
              :rules="[required('Título')]"
              hide-bottom-space
              class="q-mb-md"
            />

            <q-input
              :readonly="!rolesStore.hasPermission(RolesEnum.DEVELOPER)"
              label="Descrição"
              v-model="editedTask.description"
              outlined
              type="textarea"
              rows="3"
            />

            <TaskAttachmentsComponent
              :attachments="editedTask.attachments"
              :task-id="editedTask.id"
              :project-id="projectId"
              @attachment-removed="fetchTask"
              @files-selected="updateAttachments"
            />

            <TaskCommentsComponent
              v-if="isEditing"
              :comments="editedTask.comments"
              :isEditing="isEditing"
              :taskId="editedTask.id"
              @comments-changed="fetchTask"
            />
          </div>

          <div class="col-12 col-md-5">
            <div class="details-sidebar q-pa-md rounded-borders">
              <div class="text-subtitle1 q-mb-sm text-weight-medium">Detalhes da Tarefa</div>

              <q-select
                v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
                label="Projeto *"
                v-model="projectSelectId"
                :options="projects"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                outlined
                :rules="[required('Projeto')]"
                hide-bottom-space
                class="q-mb-sm"
                @update:model-value="fetchVersions"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-folder-open-outline" />
                </template>
              </q-select>
              <q-input
                v-else
                label="Projeto"
                :model-value="editedTask.version?.project?.name"
                outlined
                readonly
                disable
                class="q-mb-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-folder-open-outline" />
                </template>
              </q-input>
              <q-select
                v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
                label="Versão *"
                v-model="versionSelectId"
                :options="versions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                outlined
                :rules="[required('Versão')]"
                hide-bottom-space
                class="q-mb-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-tag-outline" />
                </template>
              </q-select>
              <q-input
                v-else
                label="Versão"
                :model-value="editedTask.version?.name"
                outlined
                readonly
                disable
                class="q-mb-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-tag-outline" />
                </template>
              </q-input>

              <div class="row q-mb-sm">
                <div class="q-pr-xs col-6">
                  <q-select
                    v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
                    label="Status *"
                    v-model="editedTask.status"
                    :options="statusOptions"
                    outlined
                    emit-value
                    map-options
                    :rules="[required('Status')]"
                    hide-bottom-space
                  />
                  <q-input
                    v-else
                    label="Status"
                    :model-value="
                      statusOptions.find((status) => status.value === editedTask.status)?.label
                    "
                    outlined
                    readonly
                    disable
                  />
                </div>
                <div class="q-pl-xs col-6">
                  <q-select
                    v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
                    label="Prioridade"
                    v-model="editedTask.priority"
                    :options="priorityOptions"
                    outlined
                    emit-value
                    map-options
                  />
                  <q-input
                    v-else
                    label="Prioridade"
                    :model-value="
                      priorityOptions.find((priority) => priority.value === editedTask.priority)
                        ?.label
                    "
                    outlined
                    readonly
                    disable
                  />
                </div>
              </div>

              <q-input
                v-if="isMyTasks || !rolesStore.hasPermission(RolesEnum.DEVELOPER)"
                label="Responsável"
                :model-value="authStore.user.username"
                outlined
                readonly
                disable
                class="q-mb-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-account-star-outline" />
                </template>
              </q-input>
              <q-select
                v-else
                label="Responsável"
                v-model="editedTask.assigneeId"
                :options="assigneeOptions"
                outlined
                emit-value
                map-options
                clearable
                use-input
                @filter="filterAssignee"
                class="q-mb-sm"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-account-star-outline" />
                </template>
              </q-select>

              <q-input
                v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
                label="Prazo da Tarefa"
                v-model="deadlineFormatted"
                readonly
                outlined
                mask="##/##/####"
                class="q-mb-md"
              >
                <template v-slot:append>
                  <q-icon name="mdi-calendar" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="editedTask.deadline"
                        mask="YYYY-MM-DD"
                        minimal
                        color="primary"
                      >
                        <div class="row items-center justify-end q-gutter-sm">
                          <q-btn label="OK" color="primary" flat v-close-popup />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input
                v-else
                label="Prazo da Tarefa"
                :model-value="deadlineFormatted"
                outlined
                readonly
                disable
                class="q-mb-md"
              />

              <q-select
                v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
                label="Tags"
                v-model="selectedTags"
                :options="availableTags"
                outlined
                multiple
                use-chips
                stack-label
                emit-value
                map-options
                option-value="id"
                option-label="name"
                class="q-mb-md"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section
                      :style="{
                        'background-color': scope.opt.color,
                        color: getContrastColor(scope.opt.color),
                        'border-radius': '4px',
                      }"
                    >
                      <q-item-label class="text-weight-bold q-mx-md">
                        {{ scope.opt.name }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:prepend>
                  <q-icon name="mdi-tag" />
                </template>
                <template v-slot:selected-item="scope">
                  <q-chip
                    removable
                    dense
                    @remove="scope.removeAtIndex(scope.index)"
                    :tabindex="scope.tabindex"
                    :style="{
                      'background-color': scope.opt.color,
                      color: getContrastColor(scope.opt.color),
                    }"
                  >
                    {{ scope.opt.name }}
                  </q-chip>
                </template>
              </q-select>
              <q-list v-else class="q-mb-md">
                <q-item
                  v-for="tag in editedTask.tags"
                  :key="tag.tagId"
                  class="q-mb-sm"
                  style="min-height: unset; padding: 0"
                >
                  <q-chip
                    :style="{
                      'background-color': tag.tag.color,
                      color: getContrastColor(tag.tag.color),
                    }"
                  >
                    {{ tag.tag.name }}
                  </q-chip>
                </q-item>
              </q-list>

              <div v-if="isEditing" class="q-mt-md">
                <q-separator class="q-mb-md" />
                <div class="row q-col-gutter-x-md q-col-gutter-y-sm">
                  <div class="col-12 col-sm-6">
                    <div class="flex items-center">
                      <q-icon name="mdi-calendar-plus" color="grey-7" size="20px" class="q-mr-sm" />
                      <div>
                        <div class="text-caption text-grey-7">Criada em</div>
                        <div class="text-body2">
                          {{
                            new Date(editedTask.createdAt).toLocaleDateString() || 'Não disponível'
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6" v-if="editedTask.updatedAt">
                    <div class="flex items-center">
                      <q-icon
                        name="mdi-calendar-arrow-right"
                        color="grey-7"
                        size="20px"
                        class="q-mr-sm"
                      />
                      <div>
                        <div class="text-caption text-grey-7">Atualizada em</div>
                        <div class="text-body2">
                          {{ new Date(editedTask.updatedAt).toLocaleDateString() }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions class="dialog-footer" v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)">
        <q-btn label="Remover Tarefa" icon="mdi-delete" color="red" @click="deleteTask" flat />

        <q-space />

        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn
          :label="isEditing ? 'Salvar Alterações' : 'Criar Tarefa'"
          color="primary"
          type="submit"
          unelevated
        />
      </q-card-actions>
      <q-card-actions class="dialog-footer" v-else>
        <q-space />

        <q-btn label="Fechar" color="grey" v-close-popup flat />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { ref, onMounted, computed, defineComponent, Ref } from 'vue';
import { QForm, useQuasar } from 'quasar';
import { required } from 'src/utils/validation';
import { TaskI } from 'src/models/task.model';
import { TaskStatus, TaskStatusEnum } from 'src/enums/status.enum';
import { PriorityEnum, PriorityValues } from 'src/enums/task_priority.enum';
import ProjectService from 'src/services/project.service';
import { ProjectI, ProjectParticipationI } from 'src/models/project.model';
import TaskService from 'src/services/task.service';
import { getContrastColor } from 'src/utils/utils';
import { TagI } from 'src/models/tag.model';
import TagService from 'src/services/tag.service';
import { TaskTagI } from 'src/models/task_tag.model';
import { VersionI } from 'src/models/version.model';
import { useApi } from 'src/services/useApi';
import VersionService from 'src/services/version.service';
import TaskAttachmentsComponent from '../lists/TaskAttachments.component.vue';
import TaskCommentsComponent from '../lists/TaskComments.component.vue';
import TaskHistoryDialog from './TaskHistoryDialog.component.vue';
import { useAuthStore } from 'src/stores/authStore';
import { useRolesStore } from 'src/stores/rolesStore';
import { RolesEnum } from 'src/enums/roles.enum';

export default defineComponent({
  props: {
    taskId: {
      type: Number,
      default: null,
    },
    statusId: {
      type: Number as () => TaskStatusEnum,
      default: TaskStatusEnum.PENDING,
    },
    versionId: {
      type: Number,
      default: null,
    },
    projectId: {
      type: Number,
      default: null,
    },
  },
  emits: ['close'],
  components: {
    TaskAttachmentsComponent,
    TaskCommentsComponent,
    TaskHistoryDialog,
  },
  setup(props, { emit }) {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const formRef = ref<QForm | null>(null);
    const isEditing = computed(() => !!props.taskId);
    const isMyTasks = computed(() => !(!!props.projectId && !!props.versionId));
    const availableTags = ref<TagI[]>([]);
    const selectedTags = ref<number[]>([]);
    const projects = ref<ProjectI[]>([]);
    const versions = ref<VersionI[]>([]);
    const projectSelectId = ref<number | null>(null);
    const versionSelectId = ref<number | null>(null);
    const showHistoryDialog = ref(false);

    const authStore = useAuthStore();
    const rolesStore = useRolesStore();

    const defaultTask: TaskI = {
      id: null,
      title: '',
      description: '',
      status: props.statusId,
      priority: PriorityEnum.MEDIUM,
      assigneeId: null,
      deadline: null,
      versionId: props.versionId,
      tags: [],
      attachments: [],
      comments: [],
      createdAt: null,
      updatedAt: null,
    };

    const editedTask = ref<TaskI>({ ...defaultTask });
    const files = ref<File[]>([]);

    const allAssignees = ref<ProjectParticipationI[]>([]);
    const assigneeOptions = ref<{ label: string; value: number }[]>([]);

    const getTitle = () => {
      return rolesStore.hasPermission(RolesEnum.DEVELOPER)
        ? isEditing.value
          ? 'Editar Tarefa'
          : 'Criar Nova Tarefa'
        : 'Detalhes da Tarefa';
    };

    const statusOptions = ref<{ label: string; value: TaskStatusEnum }[]>(
      TaskStatus.map((status) => ({
        label: status.name,
        value: status.id,
      })),
    );

    const priorityOptions = ref<{ label: string; value: PriorityEnum }[]>(
      PriorityValues.map((priority) => ({
        label: priority.name,
        value: priority.id,
      })),
    );

    async function fetchProjects() {
      const data = await handleApi<ProjectI[]>(() => ProjectService.getAll(), {
        errorMessage: 'Ocorreu um erro ao buscar projetos.',
      });
      projects.value = data;
      const project = projects.value.find((p) => p.id === props.projectId);
      if (project) {
        projectSelectId.value = project.id;
        fetchVersions(project.id);
      }
    }

    async function fetchVersions(projectId: number) {
      const data = await handleApi<VersionI[]>(() => VersionService.getAll(projectId), {
        errorMessage: 'Ocorreu um erro ao buscar versões.',
      });
      versions.value = data;
      const version = versions.value.find(
        (v) => v.id === props.versionId || v.id === editedTask.value.versionId,
      );
      if (version) {
        versionSelectId.value = version.id;
      } else {
        versionSelectId.value = null;
      }
      fetchTags(projectId);
    }

    async function fetchTask() {
      if (!props.taskId) return;
      const data = await handleApi<TaskI>(() => TaskService.getOne(props.taskId), {
        errorMessage: 'Ocorreu um erro ao buscar a tarefa.',
      });

      editedTask.value = { ...data };
      if (data.deadline) {
        const date = new Date(data.deadline);
        editedTask.value.deadline = date.toISOString().split('T')[0];
      }
      if (data.tags && data.tags.length > 0) {
        selectedTags.value = [];
        data.tags.forEach((e) => {
          selectedTags.value.push(e.tagId);
        });
      }

      projectSelectId.value = data.version?.project?.id;
      versionSelectId.value = data.version?.id;

      const promises = [fetchProjects(), fetchVersions(projectSelectId.value)];

      if (!isMyTasks.value) {
        promises.push(fetchUsers());
        promises.push(fetchTags(projectSelectId.value));
      }

      await Promise.all(promises);
    }

    async function fetchUsers() {
      const data = await handleApi<ProjectParticipationI[]>(
        () => ProjectService.getMembers(props.projectId),
        {
          hideErrorMessage: true,
        },
      );
      allAssignees.value = data;
      assigneeOptions.value = allAssignees.value.map((u) => ({
        label: u.user.username,
        value: u.user.id,
      }));
    }

    async function fetchTags(projectId: number = props.projectId) {
      const data = await handleApi<TagI[]>(() => TagService.getAll(projectId), {
        hideErrorMessage: true,
      });

      availableTags.value = data;
    }

    function filterAssignee(val: string, update: (callbackFn: () => void) => void) {
      if (val === '') {
        update(() => {
          assigneeOptions.value = allAssignees.value.map((u) => ({
            label: u.user.username,
            value: u.user.id,
          }));
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        assigneeOptions.value = allAssignees.value
          .filter((v) => v.user.username.toLowerCase().indexOf(needle) > -1)
          .map((u) => ({ label: u.user.username, value: u.user.id }));
      });
    }

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

    function updateTaskTags() {
      if (selectedTags.value.length > 0) {
        selectedTags.value.forEach((tagId) => {
          const taskTag: TaskTagI = {
            taskId: editedTask.value.id,
            tagId: tagId,
          };
          editedTask.value.tags.push(taskTag);
        });
      }

      for (let i = editedTask.value.tags.length - 1; i >= 0; i--) {
        const existingTag = editedTask.value.tags[i];
        if (!selectedTags.value.includes(existingTag.tagId)) {
          editedTask.value.tags.splice(i, 1);
        }
      }
    }

    function buildFormData() {
      const formData = new FormData();
      formData.append('task', JSON.stringify(editedTask.value));
      if (files.value.length > 0) {
        files.value.forEach((file) => formData.append('attachment', file));
      }
      return formData;
    }

    async function onSave(): Promise<void> {
      const isValid = await formRef.value?.validate();
      if (!isValid) {
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
        return;
      }

      updateTaskTags();
      editedTask.value.versionId = versionSelectId.value;
      if (isMyTasks.value) {
        editedTask.value.assigneeId = authStore.user.id;
      }

      const formData = buildFormData();

      const apiCall = () =>
        isEditing.value
          ? TaskService.update(props.taskId, formData, projectSelectId.value)
          : TaskService.create(formData, projectSelectId.value);

      await handleApi(apiCall, {
        successMessage: `Tarefa ${isEditing.value ? 'atualizada' : 'criada'} com sucesso!`,
        errorMessage: `Ocorreu um erro ao ${isEditing.value ? 'atualizar' : 'criar'} a tarefa.`,
      });

      emit('close');
    }

    async function deleteTask() {
      $q.dialog({
        title: 'Confirmar Exclusão',
        message: 'Tem certeza de que deseja excluir esta tarefa permanentemente?',
        cancel: {
          label: 'Não',
          color: 'grey',
          flat: true,
        },
        ok: {
          label: 'Sim',
          color: 'red',
        },
        persistent: true,
      }).onOk(async () => {
        await handleApi(() => TaskService.delete(props.taskId, projectSelectId.value), {
          successMessage: 'Tarefa excluída com sucesso!',
          errorMessage: 'Ocorreu um erro ao excluir a tarefa.',
        });
        emit('close');
      });
    }

    const updateAttachments = (attachments: File[]) => {
      files.value = attachments;
    };

    onMounted(() => {
      const promises = [];
      if (isEditing.value) {
        promises.push(fetchTask());
      } else {
        promises.push(fetchProjects());
        if (!isMyTasks.value) {
          promises.push(fetchUsers(), fetchTags());
        }
      }
      Promise.all(promises);
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
      deleteTask,
      onSave,
      required,
      filterAssignee,
      getContrastColor,
      availableTags,
      selectedTags,
      isMyTasks,
      projects,
      fetchVersions,
      projectSelectId,
      versionSelectId,
      versions,
      updateAttachments,
      fetchTask,
      authStore,
      rolesStore,
      RolesEnum,
      getTitle,
      showHistoryDialog,
    };
  },
});
</script>

<style scoped>
.task-dialog-card {
  width: 100%;
  max-width: 1100px;
  min-width: 0;
  color: var(--text-color);
  box-sizing: border-box;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.dialog-footer {
  padding: 16px 24px;
}

.details-sidebar {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background-color: #f9f9f9;
}
.body--dark .details-sidebar {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background-color: #2c2c2c;
}

.comment-item {
  padding-top: 12px;
  padding-bottom: 12px;
}

@media (max-width: 1023px) {
  .details-sidebar {
    margin-top: 20px;
  }
}
</style>
