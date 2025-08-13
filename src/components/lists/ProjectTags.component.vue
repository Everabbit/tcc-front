<template>
  <q-card class="q-mb-md card-project">
    <q-dialog v-model="showDialogTags" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <AddTagDialogComponent
        @close="addTagDialog"
        :project-id="projectId"
        :tag="actuallyTag"
        v-if="showDialogTags"
      ></AddTagDialogComponent>
    </q-dialog>
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6 q-mb-sm">Etiquetas</div>
        <q-btn
          v-if="useRoles.hasPermission(RolesEnum.DEVELOPER)"
          color="primary"
          icon="add"
          :label="$q.screen.xs ? '' : 'Adicionar Etiqueta'"
          flat
          @click="addTagDialog()"
        />
      </div>

      <q-separator />
      <div class="q-mt-md">
        <q-chip
          v-for="(tag, index) in tags"
          :key="index"
          :removable="useRoles.hasPermission(RolesEnum.DEVELOPER)"
          @remove="removeTag(tag.id)"
          :style="{ 'background-color': tag.color, color: getContrastColor(tag.color) }"
          size="md"
          class="q-mr-sm q-mb-sm"
        >
          {{ tag.name }}
          <q-btn
            v-if="useRoles.hasPermission(RolesEnum.DEVELOPER)"
            flat
            dense
            icon="mdi-pencil"
            class="q-ml-sm"
            size="sm"
            @click="addTagDialog(tag)"
          />
        </q-chip>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { RolesEnum } from 'src/enums/roles.enum';
import { TagI } from 'src/models/tag.model';
import { useRolesStore } from 'src/stores/rolesStore';
import { onMounted, onUnmounted, ref } from 'vue';
import { clone } from 'src/utils/transform';
import { useQuasar } from 'quasar';
import { useApi } from 'src/services/useApi';
import TagService from 'src/services/tag.service';
import { getContrastColor } from 'src/utils/utils';
import AddTagDialogComponent from '../dialogs/AddTagDialog.component.vue';
import socket from 'src/services/socket.service';

export default {
  components: {
    AddTagDialogComponent,
  },
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  setup(props, { emit }) {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const useRoles = useRolesStore();

    const tags = ref<TagI[]>([]);

    const showDialogTags = ref<boolean>(false);
    const actuallyTag = ref<TagI>(null);

    async function addTagDialog(tag: TagI = null): Promise<void> {
      showDialogTags.value = !showDialogTags.value;
      if (showDialogTags.value === false) {
        await getTags();
      } else {
        if (tag) {
          actuallyTag.value = clone(tag);
        } else {
          actuallyTag.value = null;
        }
      }
    }

    async function removeTag(tagId: number): Promise<void> {
      $q.dialog({
        title: 'Confirmar Remoção',
        message: 'Tem certeza de que deseja remover permanentemente esta etiqueta?',
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
        await handleApi(() => TagService.removeTag(tagId, props.projectId), {
          errorMessage: 'Ocorreu um erro ao remover a etiqueta.',
          successMessage: 'Etiqueta removida com sucesso!',
        });

        await getTags();
      });
    }

    async function getTags(): Promise<void> {
      const tagsResponse = await handleApi<TagI[]>(() => TagService.getAll(props.projectId), {
        errorMessage: 'Ocorreu um erro ao buscar etiquetas.',
      });
      tags.value.splice(0, tags.value.length, ...tagsResponse);
    }

    const setupSocketListeners = () => {
      socket.on('tagCreated', (tagCreated: TagI) => {
        tags.value.push(tagCreated);
      });
      socket.on('tagUpdated', (tagUpdated: TagI) => {
        const index = tags.value.findIndex((tag) => tag.id === tagUpdated.id);
        if (index !== -1) {
          tags.value[index] = tagUpdated;
        }
      });
      socket.on('tagDeleted', (tagId: number) => {
        tags.value = tags.value.filter((tag) => tag.id !== tagId);
      });
    };

    const removeSocketListeners = () => {
      socket.off('tagCreated');
      socket.off('tagUpdated');
      socket.off('tagDeleted');
    };

    onMounted(async () => {
      await getTags();

      socket.connect();

      socket.emit('joinProjectRoom', props.projectId);

      setupSocketListeners();
    });

    onUnmounted(() => {
      removeSocketListeners();

      socket.disconnect();
    });

    return {
      useRoles,
      RolesEnum,
      showDialogTags,
      actuallyTag,
      addTagDialog,
      tags,
      removeTag,
      getContrastColor,
    };
  },
};
</script>
