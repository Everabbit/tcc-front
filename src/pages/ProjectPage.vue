<template>
  <q-page class="row justify-center items-start q-pa-md">
    <q-dialog v-model="showDialogVersion" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <CreateVersionDialog
        @close="createVersion"
        :project-id="idParse"
        :version-id="versionEditId"
        v-if="showDialogVersion"
      ></CreateVersionDialog>
    </q-dialog>
    <q-dialog v-model="showDialogMembers" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <AddMemberDialogCompoent
        @close="addmembersDialog"
        :project-id="idParse"
        :member="memberEdit"
        v-if="showDialogMembers"
      ></AddMemberDialogCompoent>
    </q-dialog>
    <q-dialog v-model="showDialogTags" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <AddTagDialogComponent
        @close="addTagDialog"
        :project-id="idParse"
        :tag="actuallyTag"
        v-if="showDialogTags"
      ></AddTagDialogComponent>
    </q-dialog>
    <div class="col-12 col-md-10 col-lg-9" :style="$q.screen.xs ? `margin-bottom: 50px` : ''">
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

      <q-card class="q-mb-md card-project">
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
              v-for="(tag, index) in project.tags"
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

      <!-- Membros -->
      <q-card class="q-mb-md card-project">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-h6">Membros do Projeto</div>
            <q-btn
              v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
              color="primary"
              icon="add"
              :label="$q.screen.xs ? '' : 'Adicionar Membro'"
              flat
              @click="addmembersDialog()"
            />
          </div>
          <q-separator />

          <div class="q-mt-md">
            <q-item
              v-for="member in project.participation"
              :key="member.userId"
              class="q-mb-sm"
              :clickable="
                member.userId !== project.creatorId && useRoles.hasPermission(RolesEnum.MANAGER)
              "
              @click="addmembersDialog(member)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white"
                  ><img v-if="member.user.image" :src="member.user.image" />
                  <span v-else>{{ getUsernameInitials(member.user.username) }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ member.user.fullName }}</q-item-label>
                <q-item-label caption>{{ member.user.username }}</q-item-label>
              </q-item-section>
              <q-item-section side class="row">
                <q-badge
                  v-if="member.userId === project.creatorId"
                  label="Criador"
                  color="primary"
                />
              </q-item-section>
              <q-item-section side class="row">
                <q-badge
                  :label="roles.find((role) => role.id === member.role).name"
                  color="secondary"
                />
              </q-item-section>
              <q-item-section side class="row">
                <q-btn
                  v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
                  :disable="member.userId === project.creatorId"
                  flat
                  dense
                  icon="close"
                  class="q-ml-sm"
                  @click.stop="removeMember(member.userId)"
                >
                  <q-tooltip
                    v-if="member.userId === project.creatorId"
                    class="bg-red text-body2"
                    position="top"
                    anchor="bottom middle"
                    self="top middle"
                    :offset="[10, 10]"
                  >
                    O criador do projeto não pode ser removido.
                  </q-tooltip>
                </q-btn>
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
                v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
                color="primary"
                icon="mdi-plus"
                :label="$q.screen.xs ? '' : 'Nova Versão'"
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
                <th class="text-right" v-if="useRoles.hasPermission(RolesEnum.MANAGER)">Ações</th>
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
                    <span> {{ getPercentVersionTasks(version.id) * 100 }}% </span>
                  </div>
                  <q-linear-progress :value="getPercentVersionTasks(version.id)" color="primary" />
                </td>
                <td class="text-right" v-if="useRoles.hasPermission(RolesEnum.MANAGER)">
                  <q-btn flat dense icon="mdi-pencil" @click.stop="createVersion(version.id)" />
                  <q-btn flat dense icon="mdi-delete" @click.stop="removeVersion(version.id)" />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
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
import AddMemberDialogCompoent from 'src/components/dialogs/AddMemberDialog.component.vue';
import AddTagDialogComponent from 'src/components/dialogs/AddTagDialog.component.vue';
import CreateVersionDialog from 'src/components/dialogs/CreateVersionDialog.component.vue';
import { ProjectStatus, ProjectStatusValues } from 'src/enums/project_status.enum';
import { RolesEnum, RolesValues } from 'src/enums/roles.enum';
import { TaskStatusEnum, VersionStatus } from 'src/enums/status.enum';
import { ProjectI, ProjectParticipationI } from 'src/models/project.model';
import { TagI } from 'src/models/tag.model';
import ProjectService from 'src/services/project.service';
import VersionService from 'src/services/version.service';
import { clone, fromBase64, toBase64 } from 'src/utils/transform';
import { getContrastColor } from 'src/utils/utils';
import { required } from 'src/utils/validation';
import { computed, onMounted } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatDate, getUsernameInitials } from 'src/utils/utils';
import TagService from 'src/services/tag.service';
import { useApi } from 'src/services/useApi';
import { useRolesStore } from 'src/stores/rolesStore';

export default {
  components: {
    CreateVersionDialog,
    AddMemberDialogCompoent,
    AddTagDialogComponent,
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
    const idParse = ref<number>(parseInt(fromBase64(props.projectId)));
    const versionEditId = ref<string>(null);
    const actuallyTag = ref<TagI>(null);
    const memberEdit = ref<ProjectParticipationI>(null);

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
        await handleApi(() => VersionService.delete(id, idParse.value), {
          errorMessage: 'Ocorreu um erro ao remover a versão.',
          successMessage: 'Versão removida com sucesso!',
        });

        await getProject();
      });
    }
    async function addmembersDialog(member: ProjectParticipationI = null): Promise<void> {
      if (member && member.role <= useRoles.role) {
        $q.notify({
          type: 'negative',
          message: 'Você não tem permissão para editar a função deste membro.',
          icon: 'mdi-alert-circle',
        });
        return;
      }
      showDialogMembers.value = !showDialogMembers.value;
      memberEdit.value = null;
      if (showDialogMembers.value === false) {
        await getProject();
      } else {
        if (member) {
          memberEdit.value = clone(member);
        }
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
        await handleApi(() => TagService.removeTag(tagId, idParse.value), {
          errorMessage: 'Ocorreu um erro ao remover a etiqueta.',
          successMessage: 'Etiqueta removida com sucesso!',
        });

        await getProject();
      });
    }

    function gotToTasks(id: number) {
      const projectId = props.projectId;
      const versionId = toBase64(id.toString());
      $router.push(`/p/projetos/versoes/tarefas/${projectId}/${versionId}`);
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
        await handleApi(() => ProjectService.removeMember(idParse.value, index), {
          errorMessage: 'Ocorreu um erro ao remover o membro.',
          successMessage: 'Membro removido com sucesso!',
        });

        await getProject();
      });
    }

    function getTotalVersionTasks(versionId: number): number {
      const version = project.value.versions.find((v) => v.id === versionId);
      if (!version) {
        return 0;
      }
      return version.tasks.length;
    }

    function getCompletedVersionTasks(versionId: number): number {
      const version = project.value.versions.find((v) => v.id === versionId);
      if (!version) {
        return 0;
      }
      return version.tasks.filter((task) => task.status === TaskStatusEnum.DONE).length;
    }

    function getPercentVersionTasks(versionId: number): number {
      const completed = getCompletedVersionTasks(versionId);
      const total = getTotalVersionTasks(versionId);
      return total > 0 ? completed / total : 0;
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
      getPercentVersionTasks,
      useRoles,
      RolesEnum,
      memberEdit,
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
