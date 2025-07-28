<template>
  <q-page class="row justify-center items-start q-pa-md">
    <q-dialog persistent v-model="showDialogVersion">
      <CreateVersionDialog
        @close="createVersion"
        :project-id="idParse"
        :version-id="versionEditId"
        v-if="showDialogVersion"
      ></CreateVersionDialog>
    </q-dialog>
    <q-dialog persistent v-model="showDialogMembers">
      <AddMemberDialogCompoent
        @close="addmembersDialog"
        :project-id="idParse"
        v-if="showDialogMembers"
      ></AddMemberDialogCompoent>
    </q-dialog>
    <q-dialog persistent v-model="showDialogTags">
      <AddTagDialogComponent
        @close="addTagDialog"
        :project-id="idParse"
        :tag="actuallyTag"
        v-if="showDialogTags"
      ></AddTagDialogComponent>
    </q-dialog>
    <div class="col-12 col-md-10 col-lg-9 q-mb-md">
      <div class="q-mb-md">
        <q-btn flat round icon="arrow_back" @click="$router.back()" />
        <span class="text-h5 q-ml-sm">{{ project.name }}</span>
      </div>

      <!-- Banner Editável -->
      <div class="project-banner q-mb-lg">
        <input
          type="file"
          ref="bannerInput"
          accept="image/*"
          style="display: none"
          @change="handleBannerChange"
        />

        <div
          v-if="!project.banner"
          class="banner-placeholder"
          :style="`background-color: ${getRandomColor()};`"
          @click="$refs.bannerInput.click()"
        >
          <q-icon name="add_photo_alternate" size="2rem" />
          <div>Clique para adicionar uma imagem</div>
        </div>

        <template v-else>
          <q-img :src="project.banner" class="editable-banner" @click="$refs.bannerInput.click()">
            <div class="banner-overlay">
              <q-icon name="edit" size="1.5rem" />
              <div>Clique para trocar a imagem</div>
              <q-btn
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
                  class="q-mb-md"
                />
              </div>
              <div class="col-12 col-md-6">
                <!-- Prazo -->
                <div class="q-mb-md">
                  <q-input
                    label="Prazo do Projeto"
                    v-model="formattedData"
                    readonly
                    outlined
                    mask="##/##/####"
                    :rules="[(val) => typeof val === 'string' || '']"
                  >
                    <template v-slot:append>
                      <q-icon name="mdi-calendar" class="cursor-pointer">
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
                <div class="text-caption text-grey q-mt-md">Progresso</div>
                <div class="row">
                  <div class="col-11 q-py-sm">
                    <q-linear-progress :value="project.progress / 100" color="primary" />
                  </div>

                  <div class="q-ml-sm">
                    <span>{{ project.progress }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Descrição -->
            <div>
              <q-input
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

      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6 q-mb-sm">Etiquetas</div>
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar Etiqueta"
              flat
              @click="addTagDialog()"
            />
          </div>

          <q-separator />
          <div class="q-mt-md">
            <q-chip
              v-for="(tag, index) in project.tags"
              :key="index"
              removable
              @remove="removeTag(tag.id)"
              :style="{ 'background-color': tag.color, color: getContrastColor(tag.color) }"
              size="md"
              class="q-mr-sm q-mb-sm"
            >
              {{ tag.name }}
              <q-btn
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

      <!-- Membros -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Membros do Projeto</div>
            <q-btn
              color="primary"
              icon="add"
              label="Adicionar Membro"
              flat
              @click="addmembersDialog"
            />
          </div>
          <q-separator />

          <div class="q-mt-md">
            <q-item v-for="membro in project.participation" :key="membro.userId" class="q-mb-sm">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white"
                  ><img v-if="membro.user.image" :src="membro.user.image" />
                  <span v-else>{{ getUsernameInitials(membro.user.username) }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ membro.user.fullName }}</q-item-label>
                <q-item-label caption>{{ membro.user.username }}</q-item-label>
              </q-item-section>
              <q-item-section side class="row">
                <q-badge
                  :label="roles.find((role) => role.id === membro.role).name"
                  color="secondary"
                />
              </q-item-section>
              <q-item-section side class="row">
                <q-btn
                  flat
                  dense
                  icon="close"
                  class="q-ml-sm"
                  @click="removeMember(membro.userId)"
                />
              </q-item-section>
            </q-item>
          </div>
        </q-card-section>
      </q-card>

      <!-- Versões -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Versões</div>
            <div>
              <q-btn
                color="primary"
                icon="mdi-diversify"
                label="Ver versões"
                flat
                @click="toVersions(project.id)"
              />
              <q-btn
                color="primary"
                icon="mdi-plus"
                label="Nova Versão"
                flat
                @click="createVersion()"
              />
            </div>
          </div>
          <q-separator />

          <q-markup-table flat class="q-mt-md">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Lançamento</th>
                <th>Progresso</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="version in project.versions"
                :key="version.id"
                v-on:click="gotToTasks(version.id)"
                style="cursor: pointer"
              >
                <td>
                  <div class="text-center">{{ version.name }}</div>
                </td>
                <td>
                  <div class="text-center">
                    <q-badge
                      :color="versionStatus.find((status) => status.id === version.status).color"
                      >{{
                        versionStatus.find((status) => status.id === version.status).name
                      }}</q-badge
                    >
                  </div>
                </td>
                <td>
                  <div class="text-center">{{ formatDate(version.startDate) }}</div>
                </td>
                <td>
                  <div class="text-center">
                    <span> {{ 20 }}% </span>
                  </div>
                  <q-linear-progress :value="0 / 100" color="accent" />
                </td>
                <td class="text-right">
                  <q-btn flat dense icon="mdi-pencil" @click="createVersion(version.id)" />
                  <q-btn flat dense icon="mdi-delete" @click="removeVersion(version.id)" />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn color="red" icon="mdi-delete" round size="20px" @click="deleteProject">
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
import AddMemberDialogCompoent from 'src/components/dialogs/AddMemberDialog.component.vue';
import AddTagDialogComponent from 'src/components/dialogs/AddTagDialog.component.vue';
import CreateVersionDialog from 'src/components/dialogs/CreateVersionDialog.component.vue';
import { ProjectStatus, ProjectStatusValues } from 'src/enums/project_status.enum';
import { RolesValues } from 'src/enums/roles.enum';
import { VersionStatus } from 'src/enums/status.enum';
import { ProjectI } from 'src/models/project.model';
import { ResponseI } from 'src/models/response.model';
import { TagI } from 'src/models/tag.model';
import ProjectService from 'src/services/project.service';
import VersionService from 'src/services/version.service';
import emitter from 'src/utils/event_bus';
import { clone, fromBase64, toBase64 } from 'src/utils/transform';
import { getContrastColor } from 'src/utils/utils';
import { required } from 'src/utils/validation';
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  components: {
    CreateVersionDialog,
    AddMemberDialogCompoent,
    AddTagDialogComponent,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const $router = useRouter();
    const project = ref<ProjectI>({
      creatorId: 0,
      name: '',
      status: ProjectStatus.UNACTIVE,
      progress: 0,
    });
    const roles = clone(RolesValues);
    const showDialogVersion = ref<boolean>(false);
    const showDialogMembers = ref<boolean>(false);
    const showDialogTags = ref<boolean>(false);
    const versionStatus = clone(VersionStatus);
    const deadline = ref<string>(null);
    const status = clone(ProjectStatusValues);
    const form = ref<QForm>(null);
    const bannerFile = ref<File>(null);
    const idParse = ref<string>(fromBase64(props.id));
    const versionEditId = ref<string>(null);
    const actuallyTag = ref<TagI>(null);

    async function getProject(): Promise<void> {
      try {
        const response: ResponseI = await ProjectService.getOne(idParse.value);
        if (!response.success) {
          throw Error(response.message);
        }
        project.value = response.data;
      } catch (error) {
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao buscar projeto.',
        });
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
      try {
        const isValid: boolean = await form.value.validate();

        if (isValid) {
          $q.loading.show();
          const formData: FormData = new FormData();
          formData.append('project', JSON.stringify(project.value));
          if (bannerFile.value) {
            formData.append('banner', bannerFile.value);
          }

          const response: ResponseI = await ProjectService.update(idParse.value, formData);

          if (!response.success) {
            throw Error(response.message);
          }
          $q.loading.hide();
          $q.notify({
            type: 'positive',
            message: 'Projeto atualizado com successo!',
          });

          //reescrever formulário
          await getProject();
        } else {
          $q.notify({
            type: 'negative',
            message: 'Corrija os erros no formulário',
          });
        }
      } catch (error) {
        $q.loading.hide();
        console.error('Erro na validação:', error.message);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao validar o formulário',
        });
      }
    }
    async function deleteProject(): Promise<void> {
      try {
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
          $q.loading.show();
          const response: ResponseI = await ProjectService.delete(idParse.value);
          if (!response.success) {
            throw Error(response.message);
          }
          $q.loading.hide();
          $q.notify({
            type: 'positive',
            message: 'Projeto removido com successo!',
          });
          $router.push('/p/projetos');
        });
      } catch (error) {
        $q.loading.hide();
        console.error('Erro na validação:', error.message);
        $q.notify({
          type: 'negative',
          message: error.message || 'Ocorreu um erro ao remover projeto',
        });
      }
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

    function formatDate(date: Date): string {
      if (!date) {
        return '';
      }
      const newDate = new Date(date.toString());
      const day = newDate.getDate().toString().padStart(2, '0');
      const month = (newDate.getMonth() + 1).toString().padStart(2, '0');
      const year = newDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    function getUsernameInitials(username: string): string {
      if (!username) return '';
      const names = username.split(' ');
      if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
      } else {
        return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
      }
    }

    async function createVersion(id: number | null = null): Promise<void> {
      if (id) {
        versionEditId.value = toBase64(id.toString());
      } else {
        versionEditId.value = null;
      }
      showDialogVersion.value = !showDialogVersion.value;
      if (showDialogVersion.value === false) {
        await getProject();
      }
    }
    function toVersions(id: number) {
      $router.push('/p/projetos/versoes/' + toBase64(id.toString()));
    }
    async function removeVersion(id: number): Promise<void> {
      $q.dialog({
        title: 'Confirmar Remoção',
        message: 'Tem certeza de que deseja remover permanentemente esta versão?',
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
          const response: ResponseI = await VersionService.delete(id.toString());
          if (!response.success) {
            throw Error(response.message);
          }
          $q.loading.hide();
          $q.notify({
            type: 'positive',
            message: 'Versão removida com sucesso!',
          });
          await getProject();
        } catch (error) {
          $q.loading.hide();
          console.error('Erro ao remover versão:', error.message);
          $q.notify({
            type: 'negative',
            message: error.message || 'Ocorreu um erro ao remover a versão',
          });
        }
      });
    }
    async function addmembersDialog(): Promise<void> {
      showDialogMembers.value = !showDialogMembers.value;
      if (showDialogMembers.value === false) {
        await getProject();
      }
    }
    async function addTagDialog(tag: TagI = null): Promise<void> {
      showDialogTags.value = !showDialogTags.value;
      if (showDialogTags.value === false) {
        await getProject();
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
        try {
          $q.loading.show();
          const response: ResponseI = await ProjectService.removeTag(tagId);
          if (!response.success) {
            throw Error(response.message);
          }
          $q.loading.hide();
          $q.notify({
            type: 'positive',
            message: 'Etiqueta removida com sucesso!',
          });
          await getProject();
        } catch (error) {
          $q.loading.hide();
          console.error('Erro ao remover etiqueta:', error.message);
          $q.notify({
            type: 'negative',
            message: error.message || 'Ocorreu um erro ao remover a etiqueta',
          });
        }
      });
    }

    function gotToTasks(id: number) {
      $router.push(`/p/projetos/versoes/tarefas/${toBase64(id.toString())}`);
    }

    function removeMember(index: number): void {
      let member: string = project.value.participation.find((member) => member.userId === index)
        .user.username;
      $q.dialog({
        title: 'Confirmar Remoção',
        message: `Tem certeza de que deseja remover ${member} do projeto?`,
        cancel: {
          label: 'Não',
          color: 'grey',
          flat: true,
        },
        ok: {
          label: 'Sim',
          color: 'primary',
        },
        persistent: false,
      }).onOk(async () => {
        try {
          const response: ResponseI = await ProjectService.removeMember(idParse.value, index);

          if (!response.success) {
            throw Error(response.message);
          }

          $q.notify({
            type: 'positive',
            message: 'Membro removido com sucesso!',
          });

          await getProject();
        } catch (error) {
          console.error('Erro ao remover membro:', error);
          $q.notify({
            type: 'negative',
            message: error.message || 'Ocorreu um erro ao remover o membro.',
          });
        }
      });
    }

    onMounted(async () => {
      await getProject();
    });

    return {
      versionStatus,
      project,
      getRandomColor,
      formatDate,
      getUsernameInitials,
      roles,
      showDialogVersion,
      showDialogMembers,
      addmembersDialog,
      createVersion,
      removeMember,
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
      versionEditId,
      toVersions,
      removeVersion,
      showDialogTags,
      addTagDialog,
      getContrastColor,
      removeTag,
      actuallyTag,
      gotToTasks,
    };
  },
};
</script>

<style scoped>
.card-project {
  border-left: 4px solid var(--primary-color);
}

.project-banner {
  position: relative;
  height: 200px;
  cursor: pointer;
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
