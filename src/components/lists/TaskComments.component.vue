<template>
  <div class="q-mt-lg">
    <div class="text-subtitle1 q-mb-sm text-weight-medium">Comentários</div>
    <q-scroll-area style="height: 16vh" class="rounded-borders q-pa-sm" bordered>
      <div v-if="!comments || comments.length === 0" class="text-center text-grey q-pa-md">
        Nenhum comentário ainda.
      </div>
      <q-list separator v-else>
        <q-item v-for="comment in comments" :key="comment.id" class="comment-item">
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
              <q-btn label="Salvar" color="primary" unelevated dense @click="saveEditedComment" />
              <q-btn label="Cancelar" color="grey" flat dense @click="cancelEditingComment" />
            </div>
          </q-item-section>

          <!-- Modo de Visualização -->
          <q-item-section v-else>
            <q-item-label class="text-weight-bold">
              <span>
                {{ comment.author.username }}
              </span>
              <q-badge v-if="comment.authorRole" color="primary" class="q-ml-sm">
                {{ roles.find((role) => role.id === comment.authorRole).name }}
              </q-badge>
            </q-item-label>
            <q-item-label style="white-space: pre-wrap">{{ comment.content }}</q-item-label>
            <q-item-label caption>
              {{ new Date(comment.createdAt).toLocaleString() }}
              <span v-if="comment.edited" class="text-italic text-grey-7">(editado)</span>
            </q-item-label>
          </q-item-section>

          <!-- Botões de Ação -->
          <q-item-section v-if="authStore.user.id === comment.authorId && !editingComment" side>
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
        <q-btn round dense flat icon="mdi-send" :disable="!newCommentText" @click="addComment" />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { RolesValues } from 'src/enums/roles.enum';
import { CommentI } from 'src/models/comment.model';
import CommentService from 'src/services/comment.service';
import { useApi } from 'src/services/useApi';
import { useAuthStore } from 'src/stores/authStore';
import { useRolesStore } from 'src/stores/rolesStore';
import { clone } from 'src/utils/transform';
import { getUsernameInitials } from 'src/utils/utils';
import { PropType, ref } from 'vue';

export default {
  props: {
    comments: {
      type: Array as PropType<CommentI[]>,
      required: true,
    },
    isEditing: {
      type: Boolean,
      required: true,
    },
    taskId: {
      type: Number,
      default: null,
    },
  },
  emits: ['comments-changed'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const authStore = useAuthStore();
    const rolesStore = useRolesStore();
    const newCommentText = ref<string>('');
    const editingComment = ref<CommentI | null>(null);
    const editedCommentContent = ref<string>('');
    const roles = clone(RolesValues);

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

      const editedComment: CommentI = {
        ...editingComment.value,
        content: editedCommentContent.value,
        authorRole: rolesStore.role,
        edited: true,
      };

      if (props.isEditing) {
        await handleApi<CommentI>(() => CommentService.update(editedComment), {
          errorMessage: 'Ocorreu um erro ao atualizar o comentário.',
          successMessage: 'Comentário atualizado com sucesso!',
        });
        emit('comments-changed');
      }
      cancelEditingComment();
    };

    const removeComment = (commentToRemove: CommentI) => {
      $q.dialog({
        title: 'Confirmar Remoção',
        message: 'Tem certeza que deseja remover este comentário?',
        cancel: { label: 'Não', color: 'grey', flat: true },
        ok: { label: 'Sim, remover', color: 'negative', unelevated: true },
        persistent: true,
      }).onOk(async () => {
        if (props.isEditing) {
          await handleApi<null>(() => CommentService.delete(commentToRemove.id), {
            errorMessage: 'Ocorreu um erro ao remover o comentário.',
            successMessage: 'Comentário removido com sucesso!',
          });
          emit('comments-changed');
        }
      });
    };

    const addComment = async (): Promise<void> => {
      if (!newCommentText.value.trim()) return;

      const newComment: CommentI = {
        id: 0,
        taskId: props.taskId,
        authorId: authStore.user.id,
        content: newCommentText.value,
        authorRole: rolesStore.role,
        createdAt: new Date(),
        edited: false,
        author: authStore.user,
        updatedAt: undefined,
      };
      if (props.isEditing) {
        await handleApi<CommentI>(() => CommentService.create(newComment), {
          errorMessage: 'Ocorreu um erro ao adicionar o comentário.',
        });
        emit('comments-changed');
        newCommentText.value = '';
        $q.notify({ type: 'positive', message: 'Comentário adicionado com sucesso!' });
      }
    };

    return {
      newCommentText,
      editingComment,
      editedCommentContent,
      getUsernameInitials,
      startEditingComment,
      cancelEditingComment,
      saveEditedComment,
      addComment,
      removeComment,
      authStore,
      roles,
    };
  },
};
</script>

<style scoped></style>
