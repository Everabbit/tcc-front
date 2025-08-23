<template>
  <q-item
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
      <q-item-label caption class="q-pt-xs">
        Recebido em: {{ formatDate(notification.createdAt) }}</q-item-label
      >
    </q-item-section>

    <q-item-section side top>
      <q-badge v-if="!notification.isRead" color="primary" rounded floating />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { NOTIFICATION_TYPES, NotificationType } from 'src/enums/notification_type.enum';
import { NotificationI } from 'src/models/notification.model';
import { toBase64 } from 'src/utils/transform';
import { formatDate } from 'src/utils/utils';
import { PropType } from 'vue';
import { useRouter } from 'vue-router';

export default {
  props: {
    notification: {
      type: Object as PropType<NotificationI>,
      required: true,
    },
  },
  setup() {
    const router = useRouter();

    const goTo = (notification: NotificationI) => {
      const id = toBase64(notification.id.toString());
      router.push(`/p/notificacoes/${id}`);
    };

    const getNotificationColor = (type: NotificationType): string => {
      const notificationType = NOTIFICATION_TYPES.find((n) => n.id === type);
      return notificationType ? notificationType.color : 'grey';
    };

    const getNotificationIcon = (type: NotificationType): string => {
      const notificationType = NOTIFICATION_TYPES.find((n) => n.id === type);
      return notificationType ? notificationType.icon : 'mdi-bell';
    };
    return {
      goTo,
      getNotificationColor,
      getNotificationIcon,
      formatDate,
    };
  },
};
</script>
