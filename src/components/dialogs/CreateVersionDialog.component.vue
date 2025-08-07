<template>
  <q-card class="dialog-card">
    <q-form ref="form" v-on:submit="addVersion">
      <!-- Cabeçalho -->
      <q-card-section class="dialog-header">
        <div class="text-h6">Nova Versão</div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>
      <!-- Conteúdo -->
      <q-card-section class="dialog-content">
        <!-- Nome da Versão -->
        <q-input
          label="Nome da Versão *"
          v-model="versionCreateData.name"
          autofocus
          outlined
          class="q-mb-md"
          :rules="[required('Nome da versão')]"
          hide-bottom-space
        />
        <!-- Descrição -->
        <q-input
          label="Descrição (Opcional)"
          v-model="versionCreateData.description"
          outlined
          type="textarea"
          rows="3"
          class="q-mb-md"
        />

        <!-- Datas -->
        <div class="row q-mb-md">
          <!-- Preencher StartDate -->
          <div
            :class="
              ($q.screen.xs || $q.screen.sm ? 'q-pr-none ' : 'q-pr-sm ') +
              ' col-xs-12 col-sm-12 col-md-6'
            "
          >
            <q-input
              label="Inicio da Versão"
              :model-value="formatDate(new Date(versionCreateData.startDate))"
              readonly
              outlined
              mask="##/##/####"
              hide-bottom-space
              class="q-mt-sm"
            >
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="versionCreateData.startDate"
                      minimal
                      color="primary"
                      text-color="white"
                      today-btn
                    >
                      <div class="row items-center justify-end q-gutter-sm">
                        <q-btn label="OK" color="primary" flat v-close-popup />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
          <!-- Preencher EndDate -->
          <div
            :class="
              ($q.screen.xs || $q.screen.sm ? ' ' : 'q-pl-sm ') + 'col-xs-12 col-sm-12 col-md-6'
            "
          >
            <q-input
              label="Prazo da Versão"
              :model-value="
                versionCreateData.endDate ? formatDate(new Date(versionCreateData.endDate)) : ''
              "
              readonly
              outlined
              mask="##/##/####"
              hide-bottom-space
              class="q-mt-sm"
            >
              <template v-slot:append>
                <q-icon name="mdi-calendar" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="versionCreateData.endDate"
                      minimal
                      color="primary"
                      text-color="white"
                      today-btn
                    >
                      <div class="row items-center justify-end q-gutter-sm">
                        <q-btn label="OK" color="primary" flat v-close-popup />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
        <!-- Status da Versão -->
        <q-select
          outlined
          v-model="versionCreateData.status"
          :options="status"
          map-options
          option-label="name"
          option-value="id"
          emit-value
          label="Status"
          class="col"
        >
          <template v-slot:prepend>
            <q-icon name="mdi-developer-board" />
          </template>
        </q-select>
      </q-card-section>

      <!-- Rodapé -->
      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn :label="getButtonName" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { QForm, useQuasar } from 'quasar';
import { VersionStatus, VersionStatusEnum } from 'src/enums/status.enum';
import { VersionCreateI } from 'src/models/version.model';
import { useApi } from 'src/services/useApi';
import VersionService from 'src/services/version.service';
import { clone, fromBase64 } from 'src/utils/transform';
import { formatDate } from 'src/utils/utils';
import { required } from 'src/utils/validation';
import { computed, onMounted, ref } from 'vue';

export default {
  props: {
    projectId: {
      type: Number,
      required: true,
    },
    versionId: {
      type: String,
      required: false,
    },
  },
  setup(props, { emit }) {
    const versionCreateData = ref<VersionCreateI>({
      name: '',
      status: VersionStatusEnum.DRAFT,
      projectId: 0,
    });
    const $q = useQuasar();
    const status = clone(VersionStatus);
    const form = ref<QForm>(null);
    const { handleApi } = useApi();

    const projectId = ref<number>(props.projectId);
    const versionId = ref<number>(parseInt(fromBase64(props.versionId)));

    const getButtonName = computed<string>(() => {
      return versionId.value ? 'Atualizar Versão' : 'Criar Versão';
    });

    async function addVersion(): Promise<void> {
      const isValid: boolean = await form.value.validate();

      if (isValid) {
        versionCreateData.value.projectId = projectId.value;
        const formData: FormData = new FormData();
        formData.append('version', JSON.stringify(versionCreateData.value));

        const apiCall = () =>
          versionId.value
            ? VersionService.update(versionId.value, formData)
            : VersionService.create(formData);

        await handleApi(apiCall, {
          successMessage: `Versão ${versionCreateData.value.name} ${
            versionId.value ? 'atualizada' : 'criada'
          } com sucesso!`,
          errorMessage: `Ocorreu um erro ao ${versionId.value ? 'atualizar' : 'criar'} a versão.`,
        });

        //limpar formulário
        versionCreateData.value = {
          name: '',
          status: VersionStatusEnum.DRAFT,
          projectId: 0,
        };

        //fechar popup
        emit('close');
      } else {
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
      }
    }

    async function getVersion(): Promise<void> {
      const data = await handleApi<VersionCreateI>(
        () => VersionService.getOne(versionId.value, projectId.value),
        {
          errorMessage: 'Ocorreu um erro ao buscar versão.',
        },
      );
      versionCreateData.value = data;
    }

    onMounted(async () => {
      if (props.versionId) {
        await getVersion();
      }
    });

    return {
      versionCreateData,
      required,
      form,
      status,
      addVersion,
      getButtonName,
      formatDate,
    };
  },
};
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
