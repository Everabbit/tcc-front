<template>
  <q-card class="dialog-card">
    <q-form ref="form" v-on:submit="addProject">
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
              v-model="formattedStartDate"
              readonly
              outlined
              mask="##/##/####"
              :rules="[(val) => typeof val === 'string' || '']"
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
              v-model="formattedEndDate"
              readonly
              outlined
              mask="##/##/####"
              :rules="[(val) => typeof val === 'string' || '']"
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
        <q-btn label="Criar Versão" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { version } from 'os';
import { QForm, useQuasar } from 'quasar';
import { VersionStatus, VersionStatusEnum } from 'src/enums/status.enum';
import { ResponseI } from 'src/models/response.model';
import { VersionCreateI } from 'src/models/version.model';
import VersionService from 'src/services/version.service';
import emitter from 'src/utils/event_bus';
import { clone } from 'src/utils/transform';
import { required } from 'src/utils/validation';
import { computed, ref } from 'vue';

export default {
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const versionCreateData = ref<VersionCreateI>({
      name: '',
      status: VersionStatusEnum.DRAFT,
      projectId: 0,
    });
    const $q = useQuasar();
    const status = clone(VersionStatus);
    const form = ref<QForm>(null);

    const formattedStartDate = computed<string>(() => {
      let formatted: string = versionCreateData.value.startDate;

      if (formatted) {
        const parts: string[] = formatted.split('/');
        if (parts.length === 3) {
          return (formatted = `${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      }
      return formatted;
    });
    const formattedEndDate = computed<string>(() => {
      let formatted: string = versionCreateData.value.endDate;

      if (formatted) {
        const parts: string[] = formatted.split('/');
        if (parts.length === 3) {
          return (formatted = `${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      }
      return formatted;
    });

    async function addProject(): Promise<void> {
      try {
        const isValid: boolean = await form.value.validate();

        if (isValid) {
          versionCreateData.value.projectId = parseInt(props.projectId);
          const formData: FormData = new FormData();
          formData.append('version', JSON.stringify(versionCreateData.value));

          const response: ResponseI = await VersionService.create(formData);

          if (!response.success) {
            throw Error(response.message);
          }

          $q.notify({
            type: 'positive',
            message: 'Projeto criado com successo!',
          });

          //limpar formulário
          versionCreateData.value = {
            name: '',
            status: VersionStatusEnum.DRAFT,
            projectId: 0,
          };

          //fechar popup
          emitter.emit('close-version-dialog');
        } else {
          $q.notify({
            type: 'negative',
            message: 'Corrija os erros no formulário',
          });
        }
      } catch (error) {
        console.error('Erro na validação:', error.message);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao validar o formulário',
        });
      }
    }
    return {
      versionCreateData,
      required,
      formattedEndDate,
      formattedStartDate,
      form,
      status,
      addProject,
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
