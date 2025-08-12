<template>
  <div class="q-mt-lg">
    <div class="text-subtitle1 q-mb-sm text-weight-medium">Anexos {{ taskId ? 'atuais' : '' }}</div>
    <q-list
      separator
      bordered
      v-if="attachments && attachments.length > 0"
      style="overflow-y: auto; max-height: 11vh"
    >
      <q-item v-for="file in attachments" :key="file.id" class="attachment-item">
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
              v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
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
    <q-separator class="q-my-sm" v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)" />
    <q-file
      v-if="rolesStore.hasPermission(RolesEnum.DEVELOPER)"
      outlined
      v-model="files"
      accept=".jpg, .jpeg, .png, .pdf, .zip, .doc, .docx"
      class="q-mt-sm"
      label="Adicionar novos arquivos"
      multiple
      counter
      use-chips
      append
      @update:model-value="setFiles"
    >
      <template v-slot:prepend>
        <q-icon name="mdi-paperclip" />
      </template>
    </q-file>
  </div>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { RolesEnum } from 'src/enums/roles.enum';
import { AttachmentI } from 'src/models/attachment.model';
import TaskService from 'src/services/task.service';
import { useApi } from 'src/services/useApi';
import { useRolesStore } from 'src/stores/rolesStore';
import { formatFileSize, getIconForFileType } from 'src/utils/utils';
import { PropType, ref } from 'vue';

export default {
  props: {
    attachments: {
      type: Array as PropType<AttachmentI[]>,
      required: true,
    },
    taskId: {
      type: Number,
      default: null,
    },
    projectId: {
      type: Number,
      default: null,
    },
  },
  emits: ['attachment-removed', 'files-selected'],
  setup(props, { emit }) {
    const $q = useQuasar();
    const rolesStore = useRolesStore();
    const { handleApi } = useApi();
    const files = ref<File[]>([]);

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
        const result = await handleApi(
          () => TaskService.deleteAttachment(attachmentId, props.projectId),
          {
            successMessage: 'Anexo removido com sucesso!',
            errorMessage: 'Erro ao remover anexo.',
          },
        );
        if (result !== null) {
          emit('attachment-removed');
        }
      });
    };

    const openAttachment = (attachmentId: number) => {
      const attachment = props.attachments.find((att) => att.id === attachmentId);
      if (attachment && attachment.url) {
        window.open(attachment.url, '_blank');
      } else {
        $q.notify({
          type: 'negative',
          message: 'URL do anexo não encontrada.',
        });
      }
    };

    const setFiles = () => {
      emit('files-selected', files.value);
    };

    return {
      getIconForFileType,
      formatFileSize,
      openAttachment,
      removeAttachment,
      files,
      setFiles,
      rolesStore,
      RolesEnum,
    };
  },
};
</script>

<style lang="scss">
.attachment-item .q-item__section--avatar {
  color: #1976d2;
}

.q-file .q-field__control {
  height: auto !important;
}
</style>
