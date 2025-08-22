<template>
  <q-card class="q-mb-md card-project">
    <q-dialog v-model="showDialogMembers" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <AddMemberDialogCompoent
        @close="addmembersDialog"
        :project-id="projectId"
        :member="memberEdit"
        v-if="showDialogMembers"
      ></AddMemberDialogCompoent>
    </q-dialog>

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
        <div v-if="acceptedMembers.length > 0">
          <div class="text-subtitle1 q-mb-sm">Membros</div>
          <q-list separator>
            <q-item
              v-for="member in acceptedMembers"
              :key="member.userId"
              class="q-mb-sm"
              :clickable="member.userId !== creatorId && useRoles.hasPermission(RolesEnum.MANAGER)"
              @click="addmembersDialog(member)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  <img v-if="member.user?.image" :src="member.user.image" />
                  <span v-else>{{ getUsernameInitials(member.user?.username) }}</span>
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ member.user?.fullName }}</q-item-label>
                <q-item-label caption>{{ member.user?.username }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge v-if="member.userId === creatorId" label="Criador" color="accent" />
                <q-badge
                  v-else
                  :label="roles.find((role) => role.id === member.role).name"
                  color="secondary"
                />
              </q-item-section>

              <q-item-section side>
                <q-btn
                  v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
                  :disable="member.userId === creatorId"
                  flat
                  dense
                  round
                  icon="close"
                  @click.stop="removeMember(member.userId)"
                >
                  <q-tooltip
                    v-if="member.userId === creatorId"
                    class="bg-red text-body2"
                    :offset="[10, 10]"
                  >
                    O criador do projeto não pode ser removido.
                  </q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <div v-if="pendingMembers.length > 0" class="q-mt-lg">
          <div class="text-subtitle1 q-mb-sm">Convites Pendentes</div>
          <q-list separator>
            <q-item
              v-for="member in pendingMembers"
              :key="member.userId"
              class="q-mb-sm"
              :clickable="useRoles.hasPermission(RolesEnum.MANAGER)"
              @click="addmembersDialog(member)"
            >
              <q-item-section avatar>
                <q-avatar color="grey" text-color="white">
                  <img v-if="member.user?.image" :src="member.user.image" />
                  <span v-else>{{ getUsernameInitials(member.user?.username) }}</span>
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ member.user?.fullName }}</q-item-label>
                <q-item-label caption>{{ member.user?.username }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label caption class="row items-center">
                  <q-icon name="schedule" class="q-mr-xs" />
                  Aguardando aceitação
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
                  flat
                  dense
                  round
                  icon="close"
                  @click.stop="removeMember(member.userId)"
                  aria-label="Cancelar Convite"
                >
                  <q-tooltip class="bg-primary text-body2" :offset="[10, 10]">
                    Cancelar convite
                  </q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { mdiConsoleNetworkOutline } from '@quasar/extras/mdi-v4';
import { useQuasar } from 'quasar';
import AddMemberDialogCompoent from 'src/components/dialogs/AddMemberDialog.component.vue';
import { RolesEnum, RolesValues } from 'src/enums/roles.enum';
import { ProjectParticipationI } from 'src/models/project.model';
import ProjectService from 'src/services/project.service';
import socket from 'src/services/socket.service';
import { useApi } from 'src/services/useApi';
import { useRolesStore } from 'src/stores/rolesStore';
import { clone } from 'src/utils/transform';
import { getUsernameInitials } from 'src/utils/utils';
import { computed, onMounted, onUnmounted, ref } from 'vue';

export default {
  components: {
    AddMemberDialogCompoent,
  },
  props: {
    projectId: {
      type: Number,
      required: true,
    },
    creatorId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const useRoles = useRolesStore();
    const showDialogMembers = ref<boolean>(false);
    const memberEdit = ref<ProjectParticipationI>(null);
    const members = ref<ProjectParticipationI[]>([]);
    const roles = clone(RolesValues);

    async function getAllMembers(): Promise<void> {
      const membersResponse = await handleApi<ProjectParticipationI[]>(
        () => ProjectService.getMembers(props.projectId),
        {
          errorMessage: 'Ocorreu um erro ao buscar membros.',
        },
      );
      members.value.splice(0, members.value.length, ...membersResponse);
    }

    const acceptedMembers = computed(() => {
      return orderedMembers.value.filter((member) => member.accepted);
    });

    const pendingMembers = computed(() => {
      return orderedMembers.value.filter((member) => !member.accepted);
    });

    const orderedMembers = computed(() => {
      return [...members.value].sort((a, b) => {
        if (a.role !== b.role) {
          return a.role - b.role;
        }
        return new Date(a.invitedAt).getTime() - new Date(b.invitedAt).getTime();
      });
    });

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
        await getAllMembers();
      } else {
        if (member) {
          memberEdit.value = clone(member);
        }
      }
    }

    function removeMember(userId: number): void {
      const memberToRemove = members.value.find((m) => m.userId === userId);
      const memberName = memberToRemove?.user?.username || 'este membro';
      $q.dialog({
        title: 'Confirmar Remoção',
        message: `Tem certeza de que deseja remover ${memberName} do projeto?`,
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
        await handleApi(() => ProjectService.removeMember(props.projectId, userId), {
          errorMessage: 'Ocorreu um erro ao remover o membro.',
          successMessage: 'Membro removido com sucesso!',
        });

        await getAllMembers();
      });
    }

    const setupSocketListeners = () => {
      socket.on('memberAdded', (member: ProjectParticipationI) => {
        members.value.push(member);
      });

      socket.on('memberUpdated', (updatedMember: ProjectParticipationI) => {
        const index = members.value.findIndex((m) => m.userId === updatedMember.userId);
        if (index !== -1) {
          members.value[index] = updatedMember;
        }
      });

      socket.on('memberRemoved', (userId: number) => {
        members.value = members.value.filter((member) => member.userId !== userId);
      });
    };

    const removeSocketListeners = () => {
      socket.off('memberAdded');
      socket.off('memberUpdated');
      socket.off('memberRemoved');
    };

    onMounted(async () => {
      await getAllMembers();

      socket.connect();

      socket.emit('joinProjectRoom', props.projectId);

      setupSocketListeners();
    });

    onUnmounted(() => {
      removeSocketListeners();

      socket.disconnect();
    });

    return {
      showDialogMembers,
      memberEdit,
      addmembersDialog,
      getAllMembers,
      getUsernameInitials,
      orderedMembers,
      useRoles,
      RolesEnum,
      roles,
      removeMember,
      acceptedMembers,
      pendingMembers,
    };
  },
};
</script>
