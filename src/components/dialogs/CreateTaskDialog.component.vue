<template>
  <q-card class="task-dialog-card">
    <q-form ref="formRef" @submit="onSave">
      <q-card-section class="dialog-header">
        <div class="text-h6">
          <q-icon name="mdi-format-list-bulleted-square" class="q-mr-sm" />
          {{ isEditing ? 'Editar Tarefa' : 'Criar Nova Tarefa' }}
        </div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-x-lg q-col-gutter-y-md">
          <div class="col-12 col-md-7">
            <q-input
              label="Título da Tarefa *"
              v-model="editedTask.title"
              autofocus
              outlined
              :rules="[required('Título')]"
              hide-bottom-space
              class="q-mb-md"
            />

            <q-input
              label="Descrição"
              v-model="editedTask.description"
              outlined
              type="textarea"
              rows="5"
            />

            <div class="q-mt-lg">
              <div class="text-subtitle1 q-mb-sm text-weight-medium">Anexos atuais</div>
              <q-list
                separator
                bordered
                v-if="editedTask.attachments && editedTask.attachments.length > 0"
                style="overflow-y: auto; max-height: 11vh"
              >
                <q-item
                  v-for="file in editedTask.attachments"
                  :key="file.id"
                  class="attachment-item"
                >
                  <q-item-section avatar>
                    <q-icon :name="getIconForFileType(file.type)" size="md" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ file.fileName }}</q-item-label>
                    <q-item-label caption>{{ formatFileSize(file.size) }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <div class="row items-center">
                      <q-btn
                        target="_blank"
                        flat
                        dense
                        round
                        icon="mdi-eye-outline"
                        color="primary"
                        @click="openAttachment(file.id)"
                      >
                        <q-tooltip>Abrir</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        dense
                        round
                        icon="mdi-delete-outline"
                        color="negative"
                        @click="removeAttachment(file.id)"
                      >
                        <q-tooltip>Remover</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-else class="text-center text-grey q-pa-md">Nenhum arquivo anexado ainda.</div>
              <q-separator class="q-my-sm" />
              <q-file
                outlined
                v-model="files"
                accept=".jpg, .jpeg, .png, .pdf, .zip, .doc, .docx"
                class="q-mt-sm"
                label="Adicionar novos arquivos"
                multiple
                counter
                use-chips
                append
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-paperclip" />
                </template>
              </q-file>
            </div>

            <div class="q-mt-lg">
              <div class="text-subtitle1 q-mb-sm text-weight-medium">Comentários</div>
              <q-scroll-area style="height: 16vh" class="rounded-borders q-pa-sm" bordered>
                <div
                  v-if="!editedTask.comments || editedTask.comments.length === 0"
                  class="text-center text-grey q-pa-md"
                >
                  Nenhum comentário ainda.
                </div>
                <q-list separator v-else>
                  <q-item
                    v-for="comment in editedTask.comments"
                    :key="comment.id"
                    class="comment-item"
                  >
                    <q-item-section avatar>
                      <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm">
                        <q-img v-if="comment.author.image" :src="comment.author.image" />
                        <span v-else>{{ getUsernameInitials(comment.author.username) }}</span>
                      </q-avatar>
                    </q-item-section>

                    <!-- Modo de Edição -->
                    <q-item-section v-if="editingComment?.id === comment.id">
                      <q-input
                        v-model="editedCommentContent"
                        type="textarea"
                        rows="2"
                        dense
                        autofocus
                        outlined
                        @keyup.esc="cancelEditingComment"
                      />
                      <div class="q-mt-sm q-gutter-sm">
                        <q-btn
                          label="Salvar"
                          color="primary"
                          unelevated
                          dense
                          @click="saveEditedComment"
                        />
                        <q-btn
                          label="Cancelar"
                          color="grey"
                          flat
                          dense
                          @click="cancelEditingComment"
                        />
                      </div>
                    </q-item-section>

                    <!-- Modo de Visualização -->
                    <q-item-section v-else>
                      <q-item-label class="text-weight-bold">
                        {{ comment.author.username }}
                      </q-item-label>
                      <q-item-label style="white-space: pre-wrap">{{
                        comment.content
                      }}</q-item-label>
                      <q-item-label caption>
                        {{ new Date(comment.createdAt).toLocaleString() }}
                        <span v-if="comment.edited" class="text-italic text-grey-7">(editado)</span>
                      </q-item-label>
                    </q-item-section>

                    <!-- Botões de Ação -->
                    <q-item-section v-if="user.id === comment.authorId && !editingComment" side>
                      <q-btn flat dense round icon="mdi-dots-vertical">
                        <q-menu anchor="bottom right" self="top right">
                          <q-list dense style="min-width: 100px">
                            <q-item clickable v-close-popup @click="startEditingComment(comment)">
                              <q-item-section avatar>
                                <q-icon name="mdi-pencil-outline" size="xs" />
                              </q-item-section>
                              <q-item-section>Editar</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="removeComment(comment)">
                              <q-item-section avatar>
                                <q-icon name="mdi-delete-outline" size="xs" />
                              </q-item-section>
                              <q-item-section>Remover</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
              <q-input
                v-model="newCommentText"
                outlined
                type="textarea"
                placeholder="Adicionar um comentário..."
                class="q-mt-sm"
                rows="2"
              >
                <template v-slot:after>
                  <q-btn
                    round
                    dense
                    flat
                    icon="mdi-send"
                    :disable="!newCommentText"
                    @click="addComment"
                  />
                </template>
              </q-input>
            </div>
          </div>

          <div class="col-12 col-md-5">
            <div class="details-sidebar q-pa-md rounded-borders">
              <div class="text-subtitle1 q-mb-md text-weight-medium">Detalhes da Tarefa</div>

              <q-select
                label="Status *"
                v-model="editedTask.status"
                :options="statusOptions"
                outlined
                emit-value
                map-options
                :rules="[required('Status')]"
                hide-bottom-space
                class="q-mb-md"
              />

              <q-select
                label="Responsável"
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

              <q-select
                label="Prioridade"
                v-model="editedTask.priority"
                :options="priorityOptions"
                outlined
                emit-value
                map-options
                class="q-mb-md"
              />

              <q-input
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

              <q-select
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

              <div v-if="isEditing" class="q-mt-md">
                <q-separator class="q-mb-md" />
                <q-list dense>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="mdi-calendar-plus" color="grey-7" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>Criada em</q-item-label>
                      <q-item-label>{{
                        new Date(editedTask.createdAt).toLocaleDateString() || 'Não disponível'
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item v-if="editedTask.updatedAt">
                    <q-item-section avatar>
                      <q-icon name="mdi-calendar-arrow-right" color="grey-7" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>Iniciada em</q-item-label>
                      <q-item-label>{{
                        new Date(editedTask.updatedAt).toLocaleDateString()
                      }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn
          :label="isEditing ? 'Salvar Alterações' : 'Criar Tarefa'"
          color="primary"
          type="submit"
          unelevated
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { ref, onMounted, computed, defineComponent } from 'vue';
import { is, QForm, useQuasar } from 'quasar';
import { required } from 'src/utils/validation';
import { TaskI } from 'src/models/task.model';
import { TaskStatus, TaskStatusEnum } from 'src/enums/status.enum';
import { PriorityEnum, PriorityValues } from 'src/enums/task_priority.enum';
import ProjectService from 'src/services/project.service';
import { ProjectParticipationI } from 'src/models/project.model';
import TaskService from 'src/services/task.service';
import {
  getContrastColor,
  getIconForFileType,
  formatFileSize,
  getUsernameInitials,
} from 'src/utils/utils';
import { TagI } from 'src/models/tag.model';
import TagService from 'src/services/tag.service';
import { RefSymbol } from '@vue/reactivity';
import { TaskTagI } from 'src/models/task_tag.model';
import { CommentI } from 'src/models/comment.model';
import { UserBasicI } from 'src/models/user.model';
import { getUserBasicInfo } from 'src/utils/user.utils';

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
      required: true,
    },
    projectId: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],

  setup(props, { emit }) {
    const $q = useQuasar();
    const formRef = ref<QForm | null>(null);
    const isEditing = computed(() => !!props.taskId);
    const newCommentText = ref<string>('');
    const availableTags = ref<TagI[]>([]);
    const selectedTags = ref<number[]>([]);
    const editingComment = ref<CommentI | null>(null);
    const editedCommentContent = ref<string>('');

    const user = ref<UserBasicI>(getUserBasicInfo());

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

    async function fetchTask() {
      if (!props.taskId) return;
      try {
        $q.loading.show();
        const response = await TaskService.getOne(props.taskId);
        if (!response.success) {
          throw Error(response.message);
        }
        editedTask.value = { ...response.data };
        if (response.data.deadline) {
          const date = new Date(response.data.deadline);
          editedTask.value.deadline = date.toISOString().split('T')[0];
        }
        if (response.data.tags && response.data.tags.length > 0) {
          await fetchTags();

          response.data.tags.forEach((e) => {
            selectedTags.value.push(e.tagId);
          });
        }
        if (response.data.assigneeId) {
          await fetchUsers();
        }

        $q.loading.hide();
      } catch (error) {
        $q.loading.hide();
        console.error('Erro ao buscar tarefa:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar a tarefa.',
        });
      }
    }

    async function fetchUsers() {
      try {
        $q.loading.show();
        const response = await ProjectService.getMembers(props.projectId);

        if (!response.success) {
          throw Error(response.message);
        }
        allAssignees.value = response.data;
        assigneeOptions.value = allAssignees.value.map((u) => ({
          label: u.user.username,
          value: u.user.id,
        }));
        $q.loading.hide();
      } catch (error) {
        $q.loading.hide();
        console.error('Erro:', error);
      }
    }

    async function fetchTags() {
      try {
        $q.loading.show();
        const response = await TagService.getAll(props.projectId);

        if (!response.success) {
          throw Error(response.message);
        }
        availableTags.value = response.data;
        $q.loading.hide();
      } catch (error) {
        $q.loading.hide();
        console.error('Erro:', error);
      }
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

    async function onSave(): Promise<void> {
      try {
        const isValid = await formRef.value?.validate();
        if (!isValid) {
          $q.notify({
            type: 'negative',
            message: 'Corrija os erros no formulário',
          });
          return;
        }

        $q.loading.show();

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

        const formData = new FormData();

        formData.append('task', JSON.stringify(editedTask.value));
        if (files.value.length > 0) {
          files.value.forEach((file) => formData.append('attachment', file));
        }

        const response = isEditing.value
          ? await TaskService.update(props.taskId, formData)
          : await TaskService.create(formData);

        if (!response.success) {
          throw Error(response.message);
        }

        $q.loading.hide();
        emit('close');

        $q.notify({
          type: 'positive',
          message: `Tarefa ${isEditing.value ? 'atualizada' : 'criada'} com sucesso!`,
        });
      } catch (error) {
        $q.loading.hide();
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message:
            error.message ||
            `Ocorreu um erro ao ${isEditing.value ? 'atualizar' : 'criar'} tarefa.`,
        });
      }
    }

    const removeAttachment = (attachmentId: number) => {
      $q.dialog({
        title: 'Confirmar Remoção',
        message: 'Tem certeza de que deseja remover este anexo?',
        cancel: {
          label: 'Não',
          color: 'grey',
          flat: true,
        },
        ok: {
          label: 'Sim',
          color: 'red',
        },
        persistent: false,
      }).onOk(async () => {
        try {
          $q.loading.show();
          editedTask.value.attachments = editedTask.value.attachments.filter(
            (att) => att.id !== attachmentId,
          );
          $q.loading.hide();
          $q.notify({
            type: 'positive',
            message: 'Anexo removido com sucesso!',
          });
        } catch (error) {
          $q.loading.hide();
          console.error('Erro ao remover anexo:', error);
          $q.notify({
            type: 'negative',
            message: error.message || 'Ocorreu um erro ao remover o anexo.',
          });
        }
      });
    };

    const openAttachment = (attachmentId: number) => {
      const attachment = editedTask.value.attachments.find((att) => att.id === attachmentId);
      if (attachment && attachment.url) {
        window.open(attachment.url, '_blank');
      } else {
        $q.notify({
          type: 'negative',
          message: 'URL do anexo não encontrada.',
        });
      }
    };

    const startEditingComment = (comment: CommentI) => {
      editingComment.value = { ...comment };
      editedCommentContent.value = comment.content;
    };

    const cancelEditingComment = () => {
      editingComment.value = null;
      editedCommentContent.value = '';
    };

    const saveEditedComment = async () => {
      if (!editingComment.value || !editedCommentContent.value.trim()) return;

      try {
        $q.loading.show();
        const editedComment: CommentI = {
          ...editingComment.value,
          content: editedCommentContent.value,
        };

        const response = await TaskService.updateComment(editedComment);

        if (!response.success) {
          throw new Error(response.message);
        }

        const index = editedTask.value.comments.findIndex((c) => c.id === editingComment.value.id);
        if (index !== -1) {
          editedTask.value.comments.splice(index, 1, response.data);
        }

        $q.notify({ type: 'positive', message: 'Comentário atualizado com sucesso!' });
        cancelEditingComment();
      } catch (error) {
        console.error('Erro ao atualizar comentário:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Falha ao atualizar o comentário.',
        });
      } finally {
        $q.loading.hide();
      }
    };

    const removeComment = (commentToRemove: CommentI) => {
      $q.dialog({
        title: 'Confirmar Remoção',
        message: 'Tem certeza que deseja remover este comentário?',
        cancel: { label: 'Não', color: 'grey', flat: true },
        ok: { label: 'Sim, remover', color: 'negative', unelevated: true },
        persistent: true,
      }).onOk(async () => {
        try {
          $q.loading.show();
          const response = await TaskService.removeComment(commentToRemove.id);

          if (!response.success) {
            throw new Error(response.message);
          }

          const index = editedTask.value.comments.findIndex((c) => c.id === commentToRemove.id);
          if (index !== -1) {
            editedTask.value.comments.splice(index, 1);
          }

          $q.notify({ type: 'positive', message: 'Comentário removido com sucesso!' });
        } catch (error) {
          console.error('Erro ao remover comentário:', error);
          $q.notify({
            type: 'negative',
            message: error.message || 'Falha ao remover o comentário.',
          });
        } finally {
          $q.loading.hide();
        }
      });
    };

    const addComment = async (): Promise<void> => {
      if (!newCommentText.value.trim()) return;

      try {
        $q.loading.show();
        const newComment: CommentI = {
          id: 0,
          taskId: editedTask.value.id,
          authorId: user.value.id,
          content: newCommentText.value,
          createdAt: new Date(),
          edited: false,
          author: user.value,
          updatedAt: undefined,
        };

        const response = await TaskService.addComment(newComment);

        if (!response.success) {
          throw Error(response.message);
        }

        editedTask.value.comments.push(response.data);
        newCommentText.value = '';
        $q.loading.hide();
        $q.notify({
          type: 'positive',
          message: 'Comentário adicionado com sucesso!',
        });
      } catch (error) {
        $q.loading.hide();
        console.error('Erro ao adicionar comentário:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao adicionar o comentário.',
        });
      }
    };

    onMounted(() => {
      if (isEditing.value) {
        fetchTask();
      }
      fetchUsers();
      fetchTags();
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
      getContrastColor,
      getIconForFileType,
      formatFileSize,
      getUsernameInitials,
      newCommentText,
      availableTags,
      selectedTags,
      removeAttachment,
      openAttachment,
      addComment,
      user,
      editingComment,
      editedCommentContent,
      startEditingComment,
      cancelEditingComment,
      saveEditedComment,
      removeComment,
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

.attachment-item .q-item__section--avatar {
  color: #1976d2;
}

.comment-item {
  padding-top: 12px;
  padding-bottom: 12px;
}

.q-file .q-field__control {
  height: auto !important;
}

@media (max-width: 1023px) {
  .details-sidebar {
    margin-top: 20px;
  }
}
</style>
