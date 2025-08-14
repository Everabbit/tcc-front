<template>
  <q-page class="row justify-center items-start q-pa-md">
    <div
      class="col-12 col-md-10 col-lg-9"
      :style="$q.screen.sm || $q.screen.xs ? `margin-bottom: 50px` : ''"
    >
      <div class="q-mb-md">
        <q-btn flat round icon="arrow_back" @click="$router.back()" />
        <span class="text-h5 q-ml-sm">{{ project.name }}</span>
      </div>

      <!-- Banner Editável -->
      <div class="project-banner q-mb-lg">
        <input
          v-if="useRoles.hasPermission(RolesEnum.ADMIN)"
          type="file"
          ref="bannerInput"
          accept="image/*"
          style="display: none"
          @change="handleBannerChange"
        />

        <div
          v-if="!project.banner"
          class="banner-placeholder"
          :style="`background-color: ${getRandomColor()}; ${
            useRoles.hasPermission(RolesEnum.ADMIN) ? 'cursor: pointer' : 'cursor: default'
          }`"
          @click="($refs.bannerInput as HTMLInputElement).click()"
        >
          <q-icon
            name="add_photo_alternate"
            size="2rem"
            v-if="useRoles.hasPermission(RolesEnum.ADMIN)"
          />
          <div v-if="useRoles.hasPermission(RolesEnum.ADMIN)">Clique para adicionar uma imagem</div>
        </div>

        <template v-else>
          <q-img
            :src="project.banner"
            class="editable-banner"
            :style="`${useRoles.hasPermission(RolesEnum.ADMIN) ? 'cursor: pointer' : 'cursor: default'}`"
            @click="($refs.bannerInput as HTMLInputElement).click()"
          >
            <div class="banner-overlay" v-if="useRoles.hasPermission(RolesEnum.ADMIN)">
              <q-icon name="edit" size="1.5rem" />
              <div>Clique para trocar a imagem</div>
              <q-btn
                v-if="useRoles.hasPermission(RolesEnum.ADMIN)"
                class="delete-btn"
                size="15px"
                icon="mdi-delete"
                round
                color="red"
                @click.stop="handleBannerDelete"
              />
            </div>
          </q-img>
        </template>
      </div>

      <!-- Info do Projeto (CAMPOS EDITÁVEIS) -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <q-form ref="form">
            <div class="text-h6 q-mb-sm">Informações do Projeto</div>
            <q-separator />
            <div class="row q-col-gutter-lg q-mt-xs">
              <div class="col-12 col-md-6">
                <!-- Nome -->
                <q-input
                  :readonly="!useRoles.hasPermission(RolesEnum.ADMIN)"
                  label="Nome do Projeto *"
                  v-model="project.name"
                  autofocus
                  outlined
                  class="q-mb-md"
                  :rules="[required('Nome do projeto')]"
                  hide-bottom-space
                />
                <!-- Status -->
                <q-select
                  :readonly="!useRoles.hasPermission(RolesEnum.ADMIN)"
                  outlined
                  v-model="project.status"
                  :options="status"
                  map-options
                  option-label="name"
                  option-value="id"
                  emit-value
                  label="Status"
                  class="col q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="mdi-developer-board" />
                  </template>
                </q-select>

                <!-- Data de Criação (readonly) -->
                <q-input
                  label="Data de Criação"
                  :model-value="formatDate(project.createdAt)"
                  readonly
                  outlined
                  :class="$q.screen.xs ? '' : 'q-mb-md'"
                />
              </div>
              <div class="col-12 col-md-6">
                <!-- Prazo -->
                <div :class="$q.screen.xs ? '' : 'q-mb-md'">
                  <q-input
                    label="Prazo do Projeto"
                    v-model="formattedData"
                    readonly
                    outlined
                    mask="##/##/####"
                    :rules="[(val) => typeof val === 'string' || '']"
                  >
                    <template v-slot:append>
                      <q-icon
                        name="mdi-calendar"
                        class="cursor-pointer"
                        v-if="useRoles.hasPermission(RolesEnum.ADMIN)"
                      >
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="deadline"
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

                <!-- Progresso -->
                <div :class="'text-caption text-grey ' + $q.screen.xs ? '' : 'q-mt-md'">
                  Progresso
                </div>
                <div class="row">
                  <div class="col-grow q-py-sm">
                    <q-linear-progress :value="project.progress" color="primary" />
                  </div>

                  <div class="q-ml-sm">
                    <span>{{ project.progress * 100 }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Descrição -->
            <div :class="$q.screen.xs ? 'q-mt-md' : ''">
              <q-input
                :readonly="!useRoles.hasPermission(RolesEnum.ADMIN)"
                label="Descrição (Opcional)"
                v-model="project.description"
                outlined
                type="textarea"
                rows="3"
                class="q-mb-md"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Tags -->
      <ProjectTagsComponent :project-id="idParse" />

      <!-- Membros -->
      <ProjectMembersComponent :project-id="idParse" :creator-id="project.creatorId" />

      <!-- Versões -->
      <ProjectVersionsComponent :project-id="idParse" />
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        color="red"
        icon="mdi-delete"
        round
        size="20px"
        @click="deleteProject"
        v-if="useRoles.hasPermission(RolesEnum.ADMIN)"
      >
        <q-tooltip
          class="bg-red text-body2"
          position="top"
          anchor="bottom middle"
          self="top middle"
          :offset="[10, 10]"
        >
          Remover
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="useRoles.hasPermission(RolesEnum.ADMIN)"
        class="q-ml-sm"
        color="primary"
        icon="mdi-check"
        round
        size="20px"
        @click="updateProject"
      >
        <q-tooltip
          class="bg-primary text-body2"
          position="top"
          anchor="bottom middle"
          self="top middle"
          :offset="[10, 10]"
        >
          Salvar
        </q-tooltip>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import { QForm, useQuasar } from 'quasar';
import { ProjectStatus, ProjectStatusValues } from 'src/enums/project_status.enum';
import { RolesEnum, RolesValues } from 'src/enums/roles.enum';
import { TaskStatusEnum, VersionStatus } from 'src/enums/status.enum';
import { ProjectI, ProjectParticipationI } from 'src/models/project.model';
import ProjectService from 'src/services/project.service';
import VersionService from 'src/services/version.service';
import { clone, fromBase64, toBase64 } from 'src/utils/transform';
import { getContrastColor } from 'src/utils/utils';
import { required } from 'src/utils/validation';
import { computed, onMounted, onUnmounted } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatDate, getUsernameInitials } from 'src/utils/utils';
import { useApi } from 'src/services/useApi';
import { useRolesStore } from 'src/stores/rolesStore';
import socket from 'src/services/socket.service';
import ProjectTagsComponent from 'src/components/lists/ProjectTags.component.vue';
import ProjectMembersComponent from 'src/components/lists/ProjectMembers.component.vue';
import ProjectVersionsComponent from 'src/components/lists/ProjectVersions.component.vue';

export default {
  components: {
    ProjectVersionsComponent,
    ProjectMembersComponent,
    ProjectTagsComponent,
  },
  props: {
    projectId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const $router = useRouter();
    const { handleApi } = useApi();
    const useRoles = useRolesStore();
    const project = ref<ProjectI>({
      creatorId: 0,
      name: '',
      status: ProjectStatus.PLAN,
      progress: 0,
    });
    const deadline = ref<string>(null);
    const status = clone(ProjectStatusValues);
    const form = ref<QForm>(null);
    const bannerFile = ref<File>(null);
    const idParse = ref<number>(parseInt(fromBase64(props.projectId)));

    async function getProject(): Promise<void> {
      project.value = await handleApi<ProjectI>(() => ProjectService.getOne(idParse.value), {
        errorMessage: 'Ocorreu um erro ao buscar projeto.',
      });
      if (!project.value) {
        $router.push('/p/projetos');
      }
    }
    function handleBannerChange(e) {
      const file = e.target.files[0];
      if (file) {
        bannerFile.value = file;
        const reader = new FileReader();
        reader.onload = (event) => {
          this.project.banner = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    }
    function handleBannerDelete() {
      project.value.banner = null;
      bannerFile.value = null;
    }
    const formattedData = computed<string>(() => {
      if (deadline.value) {
        let formatted: string = deadline.value;

        if (formatted) {
          const parts: string[] = formatted.split('/');
          if (parts.length === 3) {
            return (formatted = `${parts[2]}/${parts[1]}/${parts[0]}`);
          }
        }
        return formatted;
      } else if (project.value.deadline) {
        let formatted: string = project.value.deadline.toString();
        formatted = formatted.substring(0, 10);

        if (formatted) {
          const parts: string[] = formatted.split('-');
          if (parts.length === 3) {
            return (formatted = `${parts[2]}/${parts[1]}/${parts[0]}`);
          }
        }
        return formatted;
      } else {
        return '';
      }
    });

    async function updateProject(): Promise<void> {
      const isValid: boolean = await form.value.validate();

      if (isValid) {
        const formData: FormData = new FormData();
        formData.append('project', JSON.stringify(project.value));
        if (bannerFile.value) {
          formData.append('banner', bannerFile.value);
        }

        await handleApi<ProjectI>(() => ProjectService.update(idParse.value, formData), {
          errorMessage: 'Ocorreu um erro ao atualizar o projeto.',
          successMessage: 'Projeto atualizado com sucesso!',
        });

        $router.push('/p/projetos');
      } else {
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
      }
    }
    async function deleteProject(): Promise<void> {
      $q.dialog({
        title: 'Confirmar Remoção',
        message: 'Tem certeza de que deseja remover permanentemente este projeto?',
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
        await handleApi<ProjectI>(() => ProjectService.delete(idParse.value), {
          errorMessage: 'Ocorreu um erro ao remover o projeto.',
          successMessage: 'Projeto removido com sucesso!',
        });

        $router.push('/p/projetos');
      });
    }

    function getRandomColor(): string {
      const pastelColors = [
        // '#FFB3BA', // Pastel Red
        // '#FFDFBA', // Pastel Orange
        // '#FFFFBA', // Pastel Yellow
        // '#BAFFC9', // Pastel Green
        '#BAE1FF', // Pastel Blue
        // '#E0BBE4', // Pastel Purple
        // '#FFC0CB', // Pink
        // '#F0E68C', // Khaki
        // '#ADD8E6', // Light Blue
        // '#90EE90', // Light Green
      ];
      const randomIndex = Math.floor(Math.random() * pastelColors.length);
      return pastelColors[randomIndex];
    }

    const setupSocketListeners = () => {
      socket.on('projectUpdated', (updatedProject: ProjectI) => {
        project.value = updatedProject;
      });
    };

    const removeSocketListeners = () => {
      socket.off('projectUpdated');
    };

    onMounted(async () => {
      await getProject();

      socket.connect();

      socket.emit('joinProjectRoom', idParse.value);

      setupSocketListeners();
    });

    onUnmounted(() => {
      removeSocketListeners();

      socket.disconnect();
    });

    return {
      project,
      getRandomColor,
      formatDate,
      getUsernameInitials,
      formattedData,
      deadline,
      required,
      status,
      handleBannerChange,
      updateProject,
      form,
      handleBannerDelete,
      deleteProject,
      idParse,
      getContrastColor,
      useRoles,
      RolesEnum,
    };
  },
};
</script>

<style scoped>
.card-project {
  border-left: 4px solid var(--q-primary);
}

.project-banner {
  position: relative;
  height: 200px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  overflow: hidden;

  .banner-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
  }

  .editable-banner {
    width: 100%;
    height: 100%;

    .banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover .banner-overlay {
      opacity: 1;
    }
  }

  .delete-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 10;
    opacity: 0.8;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
