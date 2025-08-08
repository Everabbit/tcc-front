<template>
  <q-card class="dialog-card">
    <q-form @submit="saveTag">
      <!-- Cabeçalho -->
      <q-card-section class="dialog-header">
        <div class="text-h6">Adicionar Etiqueta</div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Conteúdo -->
      <q-card-section class="dialog-content">
        <div class="row q-mb-md">
          <div class="col-8">
            <q-input outlined v-model="newTag.name" label="Nome da Etiqueta" hide-bottom-space>
            </q-input>
          </div>

          <div class="col-4 q-pl-md">
            <q-input
              outlined
              v-model="newTag.color"
              label="Cor"
              :style="
                '--text-color: ' +
                (newTag.color
                  ? getContrastColor(newTag.color)
                  : $q.dark.isActive
                    ? 'white'
                    : 'black') +
                '; background-color: ' +
                newTag.color
              "
            >
              <template v-slot:append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-color v-model="newTag.color" />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <!-- Rodapé -->
      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn label="Salvar Etiqueta" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { TagI } from 'src/models/tag.model';
import { getContrastColor } from 'src/utils/utils';
import TagService from 'src/services/tag.service';
import { useApi } from 'src/services/useApi';

export default defineComponent({
  name: 'AddTagDialogComponent',
  props: {
    projectId: {
      type: Number,
      required: true,
    },
    tag: {
      type: Object as PropType<TagI>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const newTag = ref<TagI>(null);
    const { handleApi } = useApi();

    if (props.tag) {
      newTag.value = props.tag;
    } else {
      newTag.value = {
        projectId: props.projectId,
        name: '',
        color: '',
      };
    }

    async function saveTag(): Promise<void> {
      const apiCall = newTag.value.id ? TagService.updateTag : TagService.addTag;
      await handleApi(() => apiCall(newTag.value), {
        successMessage: 'Etiqueta criada com sucesso!',
        errorMessage: 'Ocorreu um erro ao criar a etiqueta',
      });
      closeDialog();
    }

    function closeDialog(): void {
      emit('close');
    }

    return {
      newTag,
      saveTag,
      closeDialog,
      getContrastColor,
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
