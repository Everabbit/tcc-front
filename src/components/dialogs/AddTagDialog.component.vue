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
          <!-- campo de seleção de cor -->

          <div class="col-4 q-pl-md">
            <q-input
              outlined
              v-model="newTag.color"
              label="Cor"
              :style="
                '--text-color: ' +
                getContrastColor(newTag.color) +
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
import { useQuasar } from 'quasar';
import { TagI } from 'src/models/tag.model';
import ProjectService from 'src/services/project.service';
import { getContrastColor } from 'src/utils/utils';
import { ResponseI } from 'src/models/response.model';

export default defineComponent({
  name: 'AddTagDialogComponent',
  props: {
    projectId: {
      type: String,
      required: true,
    },
    tag: {
      type: Object as PropType<TagI>,
      required: false,
    },
  },
  setup(props, { emit }) {
    const $q = useQuasar();
    const newTag = ref<TagI>(null);

    if (props.tag) {
      newTag.value = props.tag;
    } else {
      newTag.value = {
        projectId: parseInt(props.projectId),
        name: '',
        color: '',
      };
    }

    async function saveTag(): Promise<void> {
      try {
        $q.loading.show();
        let response: ResponseI = null;
        if (newTag.value.id) {
          response = await ProjectService.updateTag(newTag.value);
        } else {
          response = await ProjectService.addTag(newTag.value);
        }

        if (!response.success) {
          throw Error(response.message);
        }
        $q.loading.hide();
        $q.notify({
          type: 'positive',
          message: 'Etiqueta criada com sucesso!',
        });
        closeDialog();
      } catch (error) {
        $q.loading.hide();
        console.error('Erro ao criar etiqueta:', error.message);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao criar a etiqueta',
        });
      }
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
  min-width: 0; /* Remove a largura mínima fixa */
  color: var(--text-color);
  box-sizing: border-box; /* Garante que padding não aumente a largura */
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding: 15px 20px;
  flex-wrap: wrap; /* Permite que os itens quebrem linha em telas pequenas */
}

.dialog-content {
  padding: 20px;
  overflow: auto; /* Adiciona scroll se o conteúdo for muito grande */
}

.dialog-footer {
  border-top: 1px solid #333;
  padding: 15px 20px;
  display: flex;
  flex-wrap: wrap; /* Para botões se ajustarem em telas pequenas */
  gap: 10px; /* Espaçamento entre itens do footer */
}

/* Media Queries para ajustes em diferentes tamanhos de tela */
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
