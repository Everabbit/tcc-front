<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8" style="max-width: 1000px">
        <q-card>
          <q-card-section class="row items-center justify-between q-py-sm">
            <div class="text-h6 q-ml-sm">Notificações</div>
            <div class="q-gutter-sm">
              <q-btn
                flat
                dense
                color="primary"
                label="Marcar todas como lidas"
                :icon-right="$q.screen.lt.sm ? 'mdi-check-all' : ''"
                :round="$q.screen.lt.sm"
              >
                <q-tooltip v-if="$q.screen.lt.sm">Marcar todas como lidas</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                color="negative"
                label="Limpar notificações"
                :disable="notifications.length === 0"
                :icon-right="$q.screen.lt.sm ? 'mdi-delete-sweep-outline' : ''"
                :round="$q.screen.lt.sm"
              >
                <q-tooltip v-if="$q.screen.lt.sm">Limpar notificações</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator />

          <q-list separator v-if="notifications.length > 0">
            <q-item
              v-for="notification in notifications"
              :key="notification.id"
              clickable
              v-ripple
              @click="goTo(notification)"
              :class="{ 'unread-notification': !notification.isRead }"
              class="q-py-md"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="getNotificationColor(notification.type)"
                  text-color="white"
                  :icon="getNotificationIcon(notification.type)"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ notification.title }}</q-item-label>
                <q-item-label caption>{{ notification.message }}</q-item-label>
                <q-item-label caption>{{ formatDate(notification.createdAt) }}</q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-badge v-if="!notification.isRead" color="primary" rounded floating />
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-section v-else class="text-center text-grey q-py-xl">
            <q-icon name="mdi-bell-off-outline" size="4rem" />
            <div class="text-h6 q-mt-md">Nenhuma notificação</div>
            <p>Você está em dia!</p>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { NotificationI } from 'src/models/notification.model';
import { useApi } from 'src/services/useApi';
import NotificationService from 'src/services/notification.service';
import { NOTIFICATION_TYPES, NotificationType } from 'src/enums/notification_type.enum';
import { formatDate } from 'src/utils/utils';
import { toBase64 } from 'src/utils/transform';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const { handleApi } = useApi();

    const notifications = ref<NotificationI[]>([]);

    // const hasUnread = computed(() => notifications.value.some((n) => !n.read));

    // const markAllAsRead = () => {
    //   notifications.value.forEach((n) => (n.read = true));
    //   $q.notify({
    //     type: 'positive',
    //     message: 'Todas as notificações foram marcadas como lidas.',
    //     icon: 'mdi-check-all',
    //   });
    // };

    // const confirmClearAll = () => {
    //   $q.dialog({
    //     title: 'Confirmar',
    //     message:
    //       'Tem certeza que deseja limpar todas as notificações? Esta ação não pode ser desfeita.',
    //     cancel: { label: 'Cancelar', flat: true },
    //     ok: { label: 'Limpar', color: 'negative' },
    //     persistent: true,
    //   }).onOk(() => {
    //     notifications.value = [];
    //     $q.notify({
    //       type: 'info',
    //       message: 'Todas as notificações foram limpas.',
    //       icon: 'mdi-delete-sweep-outline',
    //     });
    //   });
    // };

    async function getAll(): Promise<void> {
      const res = await handleApi<NotificationI[]>(() => NotificationService.getAll(), {
        errorMessage: 'Erro ao buscar notificações',
      });
      if (res) {
        notifications.value = res;
      }
    }

    const getNotificationColor = (type: NotificationType): string => {
      const notificationType = NOTIFICATION_TYPES.find((n) => n.id === type);
      return notificationType ? notificationType.color : 'grey';
    };

    const getNotificationIcon = (type: NotificationType): string => {
      const notificationType = NOTIFICATION_TYPES.find((n) => n.id === type);
      return notificationType ? notificationType.icon : 'mdi-bell';
    };

    const goTo = (notification: NotificationI) => {
      const id = toBase64(notification.id.toString());
      router.push(`/p/notificacoes/${id}`);
    };

    onMounted(async () => {
      await getAll();
    });

    return {
      notifications,
      getNotificationColor,
      getNotificationIcon,
      formatDate,
      goTo,
    };
  },
};
</script>

<style lang="scss" scoped>
.unread-notification {
  .body--light & {
    background-color: rgba(var(--q-primary-rgb), 0.08);
  }
  .body--dark & {
    background-color: lighten($dark-page, 5%);
  }

  border-left: 4px solid $primary;
}

.q-item {
  transition: background-color 0.3s ease;
}
</style>
