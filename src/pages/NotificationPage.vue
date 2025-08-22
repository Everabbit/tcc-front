<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12" style="max-width: 800px">
        <q-card v-if="loading" flat bordered>
          <q-card-section class="q-pb-none">
            <q-skeleton type="text" class="text-h6" />
            <q-skeleton type="text" class="text-subtitle1" />
            <q-skeleton type="text" width="50%" />
          </q-card-section>
          <q-card-section>
            <q-skeleton type="QBtn" width="100px" class="q-mr-sm" />
            <q-skeleton type="QBtn" width="100px" />
          </q-card-section>
        </q-card>

        <q-card v-else-if="notification" flat bordered>
          <q-card-section class="row items-center justify-between q-py-sm">
            <q-btn flat dense icon="mdi-arrow-left" no-caps @click="goBack" />
            <div class="text-h6 q-ml-sm">Detalhes da Notificação</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-gutter-y-md">
            <div>
              <q-icon
                :name="notificationIcon"
                :color="notificationColor"
                size="1.5rem"
                class="q-mr-sm"
              />
              <q-badge
                outline
                :color="notificationColor"
                :label="notificationTypeName"
                :text-color="getContrastColor(notificationColor)"
                class="q-mb-sm"
              />
              <div class="text-h5 q-mt-sm flex justify-between">
                <span>
                  {{ notification.title }}
                </span>
                <q-chip
                  class="q=mx-none"
                  v-if="notification.createdAt"
                  icon="mdi-clock-outline"
                  square
                  size="sm"
                >
                  Recebido em: {{ formatDate(notification.createdAt) }}
                </q-chip>
              </div>
            </div>

            <div class="text-body1">{{ notification.message }}</div>

            <q-separator v-if="notification.metadata" />

            <div class="flex justify-between">
              <div class="row">
                <div v-if="notification.metadata?.inviterName">
                  <div class="text-caption">Convidado por:</div>
                  <div class="text-caption">{{ notification.metadata.inviterName }}</div>
                </div>

                <div v-if="notification.metadata?.projectName" class="q-ml-lg">
                  <div class="text-caption">Projeto:</div>
                  <div class="text-caption">{{ notification.metadata.projectName }}</div>
                </div>
              </div>
              <q-btn
                v-if="canAcceptInvitation"
                unelevated
                color="positive"
                icon="mdi-check"
                label="Aceitar Convite"
                outline
                @click="acceptInvitation"
              />
            </div>
          </q-card-section>

          <q-separator />
        </q-card>

        <div v-else class="text-center q-pa-xl">
          <q-icon name="mdi-alert-circle-outline" size="4rem" color="grey-5" />
          <div class="text-h6 text-grey-7 q-mt-md">Notificação não encontrada.</div>
          <q-btn class="q-mt-lg" color="primary" label="Voltar para Notificações" @click="goBack" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { NOTIFICATION_TYPES, NotificationType } from 'src/enums/notification_type.enum';
import { formatDate, getContrastColor } from 'src/utils/utils';
import { NotificationI } from 'src/models/notification.model';
import { useApi } from 'src/services/useApi';
import NotificationService from 'src/services/notification.service';
import { fromBase64, toBase64 } from 'src/utils/transform';
import ProjectService from 'src/services/project.service';

export default defineComponent({
  props: {
    notificationId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const { handleApi } = useApi();
    const notification = ref<NotificationI | null>(null);
    const loading = ref(true);

    const idParse = ref<number>(parseInt(fromBase64(props.notificationId)));

    const fetchNotification = async () => {
      loading.value = true;
      notification.value = await handleApi<NotificationI>(
        () => NotificationService.read(idParse.value),
        {
          errorMessage: 'Ocorreu um erro ao buscar projeto.',
        },
      );
      loading.value = false;
    };

    onMounted(() => {
      if (idParse.value) {
        fetchNotification();
      } else {
        notification.value = null;
        loading.value = false;
      }
    });

    const notificationDetails = computed(() => {
      if (!notification.value) return null;
      return NOTIFICATION_TYPES.find((n) => n.id === notification.value!.type);
    });

    const notificationIcon = computed(() => notificationDetails.value?.icon || 'mdi-bell');
    const notificationColor = computed(() => notificationDetails.value?.color || 'grey');
    const notificationTypeName = computed(() => notificationDetails.value?.name || 'Desconhecido');

    const canAcceptInvitation = computed(() => {
      return (
        notification.value?.type === NotificationType.PROJECT_INVITATION &&
        notification.value?.invitationToken
      );
    });

    const acceptInvitation = async () => {
      if (!notification.value) return;
      if (notification.value.type !== NotificationType.PROJECT_INVITATION) return;
      if (!notification.value.invitationToken) return;
      const data = await handleApi(
        () => ProjectService.acceptInvite(notification.value.invitationToken),
        {
          successMessage: 'Convite aceito com sucesso!',
          errorMessage: 'Erro ao aceitar convite',
        },
      );
      if (data) {
        router.push(`/p/projetos/${toBase64(notification.value.metadata.projectId.toString())}`);
      }
    };

    const goBack = () => {
      router.push('/p/notificacoes');
    };

    return {
      notification,
      loading,
      formatDate,
      goBack,
      notificationIcon,
      notificationColor,
      notificationTypeName,
      canAcceptInvitation,
      acceptInvitation,
      getContrastColor,
    };
  },
});
</script>
