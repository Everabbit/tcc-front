<template>
  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8" style="max-width: 1000px">
        <q-card>
          <q-card-section class="row items-center justify-between q-py-sm">
            <div class="text-h6 q-ml-sm">Notificações</div>
            <div class="q-gutter-sm">
              <q-btn
                v-if="hasUnread"
                flat
                dense
                color="primary"
                :label="$q.screen.xs ? '' : 'Marcar todas como lidas'"
                icon-right="mdi-check-all"
                @click="markAllAsRead"
              >
                <q-tooltip v-if="$q.screen.lt.sm">Marcar todas como lidas</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>

          <q-separator />

          <q-list separator v-if="notifications.length > 0">
            <div v-for="notification in notifications" :key="notification.id">
              <NotificationCardComponent :notification="notification" />
            </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { NotificationI } from 'src/models/notification.model';
import { useApi } from 'src/services/useApi';
import NotificationService from 'src/services/notification.service';
import { NOTIFICATION_TYPES, NotificationType } from 'src/enums/notification_type.enum';
import { formatDate } from 'src/utils/utils';
import { toBase64 } from 'src/utils/transform';
import socket from 'src/services/socket.service';
import { useAuthStore } from 'src/stores/authStore';
import NotificationCardComponent from 'src/components/cards/NotificationCard.component.vue';

export default {
  components: {
    NotificationCardComponent,
  },
  setup() {
    const $q = useQuasar();
    const authStore = useAuthStore();
    const router = useRouter();
    const { handleApi } = useApi();

    const notifications = ref<NotificationI[]>([]);

    const hasUnread = computed(() => notifications.value.some((n) => !n.isRead));

    const markAllAsRead = async () => {
      $q.dialog({
        title: 'Marcar todas como lidas',
        message: 'Tem certeza de que deseja marcar todas as notificações como lidas?',
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
        const success = await handleApi(() => NotificationService.readAll(), {
          successMessage: 'Todas as notificações foram marcadas como lidas!',
          errorMessage: 'Erro ao marcar notificações como lidas.',
        });
        if (success) {
          notifications.value.forEach((n) => (n.isRead = true));
        }
      });
    };

    async function getAll(): Promise<void> {
      const res = await handleApi<NotificationI[]>(() => NotificationService.getAll(), {
        errorMessage: 'Erro ao buscar notificações',
      });
      if (res) {
        notifications.value = res;
      }
    }

    const setupSocketListeners = () => {
      socket.on('newNotification', (notification: NotificationI) => {
        notifications.value.unshift(notification);
      });
    };

    const removeSocketListeners = () => {
      socket.off('newNotification');
    };

    onMounted(async () => {
      await getAll();

      socket.connect();

      socket.emit('joinUserRoom', authStore.user.id.toString());

      setupSocketListeners();
    });

    onUnmounted(() => {
      removeSocketListeners();

      socket.disconnect();
    });

    return {
      notifications,
      hasUnread,
      markAllAsRead,
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
    background-color: rgba(var(--q-primary-rgb), 0.08);
  }

  border-left: 4px solid $primary;
}

.q-item {
  transition: background-color 0.3s ease;
}
</style>
