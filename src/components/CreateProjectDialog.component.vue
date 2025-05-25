<template>
  <q-card class="dialog-card">
    <q-form @submit="addProject" ref="form">
      <!-- Cabeçalho -->
      <q-card-section class="dialog-header">
        <div class="text-h6">Criar Novo Projeto</div>
        <q-btn icon="mdi-close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Conteúdo -->
      <q-card-section class="dialog-content">
        <!-- Nome do Projeto -->
        <q-input
          label="Nome do Projeto *"
          v-model="projectCreateData.name"
          outlined
          class="q-mb-md"
          :rules="[required('Nome do projeto')]"
          hide-bottom-space
        />

        <!-- Descrição -->
        <q-input
          label="Descrição (Opcional)"
          v-model="projectCreateData.description"
          outlined
          type="textarea"
          rows="3"
          class="q-mb-md"
        />

        <!-- Preencher deadline -->
        <div class="q-mb-md">
          <q-input
            label="Prazo do Projeto"
            v-model="formattedData"
            outlined
            mask="##/##/####"
            :rules="[(val) => typeof val === 'string' || 'Campo obrigatório']"
            class="q-mt-sm"
          >
            <template v-slot:append>
              <q-icon name="mdi-calendar" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date
                    v-model="projectCreateData.deadline"
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

        <!-- Upload de Banner -->
        <div class="q-mb-md">
          <label class="text-caption">Banner do Projeto (Opcional)</label>
          <q-file outlined v-model="bannerFile" accept="image/*" class="q-mt-sm">
            <template v-slot:prepend>
              <q-icon name="mdi-upload" />
            </template>
          </q-file>
        </div>
        <!-- Membros -->
        <div class="q-mb-md">
          <label class="text-caption">Membros Iniciais</label>

          <div class="row q-gutter-sm q-mt-sm">
            <q-input
              outlined
              hide-bottom-space
              v-model="projectCreateMemberData.email"
              placeholder="E-mail do membro"
              class="col"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-plus" />
              </template>
            </q-input>

            <q-select
              outlined
              v-model="projectCreateMemberData.role"
              :options="roles"
              map-options
              option-label="name"
              option-value="id"
              emit-value
              label="Função"
              class="col"
            >
              <template v-slot:prepend>
                <q-icon name="mdi-account-tie" />
              </template>
            </q-select>

            <q-btn color="primary" icon="mdi-plus" @click="addMember" />
          </div>

          <!-- Lista de Membros -->
          <q-list bordered class="q-mt-md">
            <q-item
              v-for="(member, index) in projectCreateData.members"
              :key="index"
              class="q-pa-sm"
            >
              <q-item-section>{{ member.email }}</q-item-section>

              <q-item-section side>
                <q-badge color="primary">
                  {{ roles.find((role) => role.id === member.role).name }}
                </q-badge>
              </q-item-section>

              <q-item-section side>
                <q-btn icon="mdi-close" flat dense @click="removeMember(index)" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <!-- Rodapé -->
      <q-card-actions align="right" class="dialog-footer">
        <q-btn label="Cancelar" color="grey" v-close-popup flat />
        <q-btn label="Criar Projeto" color="primary" type="submit" />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script lang="ts">
import { RolesEnum, RolesValues } from 'src/enums/roles.enum';
import { ProjectCreateI, ProjectMemberI } from 'src/models/project.model';
import { clone, fileToBase64, toBase64 } from 'src/utils/transform';
import { computed, ref } from 'vue';
import { required, validateEmail, validateSelect } from '../utils/validation';
import { QForm, useQuasar } from 'quasar';
import { ResponseI } from 'src/models/response.model';
import ProjectService from 'src/services/project.service';
import emitter from 'src/utils/event_bus';

export default {
  setup() {
    const $q = useQuasar();
    const form = ref<QForm>(null);

    const projectCreateData = ref<ProjectCreateI>({
      name: '',
      deadline: '',
      description: '',
      members: [],
    });
    const bannerFile = ref<File>(null);
    const roles = clone(RolesValues);

    const projectCreateMemberData = ref<ProjectMemberI>({
      email: '',
      name: '',
      role: 2,
    });

    const formattedData = computed<string>(() => {
      let formatted: string = projectCreateData.value.deadline;

      if (formatted) {
        const parts: string[] = formatted.split('/');
        if (parts.length === 3) {
          return (formatted = `${parts[2]}/${parts[1]}/${parts[0]}`);
        }
      }
      return formatted;
    });

    function addMember() {
      if (!validateEmail(projectCreateMemberData.value.email)) {
        return $q.notify({
          color: 'negative',
          message: 'O e-mail do membro é obrigatório.',
          icon: 'mdi-alert-circle',
        });
      }
      if (!validateSelect(projectCreateMemberData.value.role)) {
        return $q.notify({
          color: 'negative',
          message: 'A função do membro é obrigatória  .',
          icon: 'mdi-alert-circle',
        });
      }

      projectCreateData.value.members.push(clone(projectCreateMemberData.value));
      projectCreateMemberData.value.email = '';
    }

    function removeMember(index: number) {
      projectCreateData.value.members.splice(index, 1);
    }

    async function addProject(): Promise<void> {
      try {
        // Validação programática
        const isValid: boolean = await form.value.validate();

        if (isValid) {
          const formData: FormData = new FormData();
          formData.append('project', JSON.stringify(projectCreateData.value));
          if (bannerFile.value) {
            formData.append('banner', bannerFile.value);
          }

          const response: ResponseI = await ProjectService.create(formData);

          if (!response.success) {
            throw Error(response.message);
          }

          $q.notify({
            type: 'positive',
            message: 'Projeto criado com successo!',
          });

          //limpar formulário
          projectCreateData.value = {
            name: '',
            deadline: '',
            description: '',
            members: [],
          };
          bannerFile.value = null;
          projectCreateMemberData.value = {
            email: '',
            name: '',
            role: 2,
          };

          //fechar popup
          emitter.emit('close-project-dialog');
        } else {
          $q.notify({
            type: 'negative',
            message: 'Corrija os erros no formulário',
          });
        }
      } catch (error) {
        console.error('Erro na validação:', error);
        $q.notify({
          type: 'negative',
          message: 'Ocorreu um erro ao validar o formulário',
        });
      }
    }

    return {
      projectCreateData,
      formattedData,
      projectCreateMemberData,
      roles,
      addMember,
      required,
      removeMember,
      addProject,
      form,
      bannerFile,
    };
  },
};
</script>

<style>
.q-field__label {
  color: #aaa !important;
}

.q-field--outlined .q-field__control:before {
  border-color: #333 !important;
}

.q-date {
  background-color: var(--card-background) !important;
  color: var(--text-color) !important;
  border-radius: var(--border-radius) !important;
}

.q-date__header {
  background-color: rgba(0, 123, 255, 0.2) !important;
}

.q-date__calendar-item {
  color: var(--text-color) !important;
}

.q-date__calendar-item--out {
  opacity: 0.5;
}

.q-date__calendar-item--fill {
  background: rgba(0, 123, 255, 0.1);
}
</style>
