<template>
  <!-- <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8" style="max-width: 1000px">
        <q-card>
          <q-card-section class="row items-center justify-between q-py-sm">
            <div class="text-h6 q-ml-sm">Detalhes da Notificação</div>
            <q-btn flat dense icon="mdi-close" round @click="$router.go(-1)" />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-h6 q-mb-sm">{{ notification.title }}</div>
            <div class="text-subtitle1 text-grey-8 q-mb-md">{{ notification.message }}</div>
            <q-badge
              :color="getNotificationColor(notification.type)"
              :icon="getNotificationIcon(notification.type)"
              :label="getNotificationTypeName(notification.type)"
              class="q-mb-md"
            />
            <div class="text-caption text-grey-6">
              Recebido em: {{ formatDate(notification.createdAt) }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn v-if="!notification.isRead" flat color="primary" label="Marcar como lida" />
            <q-btn flat color="negative" label="Excluir" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page> -->
  <!-- pode ficar muito melhor, refaça do 0 -->

  <q-page padding>
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8" style="max-width: 1000px">
        <q-card>
          <q-card-section class="row items-center justify-between q-py-sm">
            <div class="text-h6 q-ml-sm">Detalhes da Notificação</div>
            <q-btn flat dense icon="mdi-close" round @click="$router.go(-1)" />
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-h6 q-mb-sm">{{ notification.title }}</div>
            <div class="text-subtitle1 text-grey-8 q-mb-md">{{ notification.message }}</div>
            <q-badge
              :color="getNotificationColor(notification.type)"
              :icon="getNotificationIcon(notification.type)"
              :label="getNotificationTypeName(notification.type)"
              class="q-mb-md"
            />
            <div class="text-caption text-grey-6">
              Recebido em: {{ formatDate(notification.createdAt) }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn v-if="!notification.isRead" flat color="primary" label="Marcar como lida" />
            <q-btn flat color="negative" label="Excluir" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
<script lang="ts">
import { NOTIFICATION_TYPES, NotificationType } from 'src/enums/notification_type.enum';
import { NotificationI } from 'src/models/notification.model';
import { formatDate } from 'src/utils/utils';
import { ref } from 'vue';

export default {
  setup() {
    const notification = ref<NotificationI>({
      userId: 0,
      type: NotificationType.PROJECT_INVITATION,
      title: '',
      message: '',
      isRead: false,
    });

    //preencher notification com valores de exemplo
    notification.value = {
      id: 1,
      userId: 123,
      type: NotificationType.PROJECT_INVITATION,
      title: 'Convite para Projeto',
      message: 'Você foi convidado para o projeto "TaskForge Web".',
      isRead: false,
      createdAt: new Date('2023-10-27T10:00:00Z'),
      updatedAt: new Date('2023-10-27T10:00:00Z'),
    };

    const getNotificationIcon = (type: NotificationType) => {
      const notificationType = NOTIFICATION_TYPES.find((n) => n.id === type);
      return notificationType ? notificationType.icon : 'mdi-bell';
    };

    const getNotificationColor = (type: NotificationType) => {
      const notificationType = NOTIFICATION_TYPES.find((n) => n.id === type);
      return notificationType ? notificationType.color : 'grey';
    };

    const getNotificationTypeName = (type: NotificationType) => {
      const notificationType = NOTIFICATION_TYPES.find((n) => n.id === type);
      return notificationType ? notificationType.name : 'Desconhecido';
    };

    return {
      notification,
      getNotificationIcon,
      getNotificationColor,
      getNotificationTypeName,
      formatDate,
    };
  },
};
</script>
