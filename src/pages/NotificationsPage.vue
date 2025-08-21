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
                @click="markAllAsRead"
                :disable="!hasUnread"
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
                @click="confirmClearAll"
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
            <!-- Loop através das notificações com dados de exemplo -->
            <q-item
              v-for="notification in notifications"
              :key="notification.id"
              clickable
              v-ripple
              @click="goTo(notification)"
              :class="{ 'unread-notification': !notification.read }"
              class="q-py-md"
            >
              <q-item-section avatar>
                <q-avatar
                  :color="notification.color"
                  text-color="white"
                  :icon="notification.icon"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ notification.text }}</q-item-label>
                <q-item-label caption>{{ notification.time }}</q-item-label>
              </q-item-section>

              <q-item-section side top>
                <!-- Indicador de não lido (ponto) -->
                <q-badge v-if="!notification.read" color="primary" rounded floating />
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Estado de "caixa vazia" quando não há notificações -->
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
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

// Interface para definir a estrutura de uma notificação
interface Notification {
  id: number;
  icon: string;
  color: string;
  text: string;
  time: string;
  read: boolean;
  link?: string; // Link opcional para redirecionamento ao clicar
}

export default {
  name: 'NotificationsPage',
  setup() {
    const $q = useQuasar();
    const router = useRouter();

    // Dados de exemplo para as notificações, com comentários
    const notifications = ref<Notification[]>([
      // Exemplo de notificação de comentário
      {
        id: 1,
        icon: 'mdi-comment-text-outline',
        color: 'primary',
        text: 'Ana Clara comentou na sua tarefa "Desenvolver a tela de login".',
        time: '5 min atrás',
        read: false,
        link: '/p/projetos/1/tarefas/123',
      },
      // Exemplo de notificação de sucesso/conclusão
      {
        id: 2,
        icon: 'mdi-file-check-outline',
        color: 'positive',
        text: 'O projeto "Campanha de Marketing Digital" foi concluído.',
        time: '1 hora atrás',
        read: false,
        link: '/p/projetos/2',
      },
      // Exemplo de notificação de aviso/prazo (já lida)
      {
        id: 3,
        icon: 'mdi-calendar-alert',
        color: 'warning',
        text: 'O prazo da tarefa "Revisar documentação da API" se aproxima.',
        time: '3 horas atrás',
        read: true,
        link: '/p/projetos/3/tarefas/124',
      },
      // Exemplo de notificação informativa (já lida)
      {
        id: 4,
        icon: 'mdi-account-plus-outline',
        color: 'info',
        text: 'Carlos Eduardo foi adicionado ao projeto "Atualização do Sistema Legado".',
        time: '1 dia atrás',
        read: true,
        link: '/p/projetos/3',
      },
      // Exemplo de notificação de erro/falha
      {
        id: 5,
        icon: 'mdi-alert-circle-outline',
        color: 'negative',
        text: 'Falha na integração com o sistema de pagamentos no projeto "Novo E-commerce".',
        time: '2 dias atrás',
        read: false,
        link: '/p/projetos/4',
      },
    ]);

    const hasUnread = computed(() => notifications.value.some((n) => !n.read));

    const goTo = (notification: Notification) => {
      notification.read = true;
      if (notification.link) {
        router.push(notification.link);
      }
    };

    const markAllAsRead = () => {
      notifications.value.forEach((n) => (n.read = true));
      $q.notify({
        type: 'positive',
        message: 'Todas as notificações foram marcadas como lidas.',
        icon: 'mdi-check-all',
      });
    };

    const confirmClearAll = () => {
      $q.dialog({
        title: 'Confirmar',
        message:
          'Tem certeza que deseja limpar todas as notificações? Esta ação não pode ser desfeita.',
        cancel: { label: 'Cancelar', flat: true },
        ok: { label: 'Limpar', color: 'negative' },
        persistent: true,
      }).onOk(() => {
        notifications.value = [];
        $q.notify({
          type: 'info',
          message: 'Todas as notificações foram limpas.',
          icon: 'mdi-delete-sweep-outline',
        });
      });
    };

    return {
      notifications,
      hasUnread,
      goTo,
      markAllAsRead,
      confirmClearAll,
    };
  },
};
</script>

<style lang="scss" scoped>
// Estilo para notificações não lidas, que se adapta ao tema
.unread-notification {
  // Para o tema claro, um fundo sutil com a cor primária
  .body--light & {
    background-color: rgba(var(--q-primary-rgb), 0.08);
  }
  // Para o tema escuro, um fundo um pouco mais claro que o da página
  .body--dark & {
    background-color: lighten($dark-page, 5%);
  }

  // Adiciona uma borda esquerda para maior destaque
  border-left: 4px solid $primary;
}

// Transição suave na cor de fundo ao marcar como lida
.q-item {
  transition: background-color 0.3s ease;
}
</style>
