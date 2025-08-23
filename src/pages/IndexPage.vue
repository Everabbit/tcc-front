<template>
  <q-page padding class="q-pa-md">
    <q-scroll-area :style="`height: ${$q.screen.xs ? '105px' : '200px'}`" class="q-mt-xs">
      <div :class="`row ${$q.screen.xs ? 'no-wrap' : ''}`">
        <div
          :class="`${$q.screen.xs ? 'col-2' : 'col-3'} q-pa-xs`"
          v-for="stat in dashboard.stats"
          :key="stat.title"
        >
          <q-card class="summary-card full-height" flat bordered clickable @click="goTo(stat.link)">
            <q-card-section>
              <div class="row items-start justify-between no-wrap">
                <div class="col">
                  <div class="text-caption ellipsis">{{ stat.title }}</div>
                  <div class="text-h5 text-weight-bolder">{{ stat.value }}</div>
                </div>
                <q-icon :name="stat.icon" :color="stat.color" size="2rem" class="q-ml-sm" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-scroll-area>

    <div class="row q-col-gutter-xl">
      <div class="col-12 col-lg-8">
        <div class="row items-center justify-between">
          <h2 class="text-h5 text-weight-bold">Projetos Ativos</h2>
          <q-btn
            unelevated
            color="primary"
            :label="$q.screen.xs ? '' : 'Ver Todos'"
            icon="mdi-chevron-right"
            @click="goTo('/p/projetos')"
          />
        </div>

        <q-scroll-area style="height: 60vh">
          <div class="projects-grid row" v-if="dashboard.projects.length > 0">
            <div v-for="project in dashboard.projects" :key="project.id">
              <ProjectCardComponent :project="project" />
            </div>
          </div>
          <q-item v-else>
            <q-item-section class="text-center text-grey"> Nenhum projeto ativo. </q-item-section>
          </q-item>
        </q-scroll-area>
      </div>

      <div class="col-12 q-mt-md col-lg-4">
        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <h2 class="text-h5 q-my-xs text-weight-bold">Notificações não lidas</h2>
            <q-btn
              unelevated
              color="primary"
              :label="$q.screen.xs ? '' : 'Ver Todas'"
              icon="mdi-chevron-right"
              @click="goTo('/p/notificacoes')"
            />
          </q-card-section>

          <q-scroll-area style="height: 60vh">
            <q-list separator v-if="dashboard.notifications.length > 0">
              <NotificationCardComponent
                v-for="notification in dashboard.notifications"
                :key="notification.id"
                :notification="notification"
              />
            </q-list>
            <q-item v-else>
              <q-item-section class="text-center text-grey">
                Nenhuma notificação não lida.
              </q-item-section>
            </q-item>
          </q-scroll-area>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { DashboardI, DashboardStatI } from 'src/models/dashboard.model';
import { useApi } from 'src/services/useApi';
import UserService from 'src/services/user.service';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import ProjectCardComponent from 'src/components/cards/ProjectCard.component.vue';
import NotificationCardComponent from 'src/components/cards/NotificationCard.component.vue';

export default {
  components: {
    ProjectCardComponent,
    NotificationCardComponent,
  },
  setup() {
    const { handleApi } = useApi();
    const router = useRouter();

    const tab = ref<string>('tasks');

    const dashboard = ref<DashboardI>({
      stats: [],
      projects: [],
      notifications: [],
    });

    async function getDashboard(): Promise<void> {
      const response = await handleApi<DashboardI>(() => UserService.getDashboard(), {
        errorMessage: 'Erro ao carregar o dashboard.',
      });
      dashboard.value = response;
    }

    function goTo(link: string): void {
      if (link) {
        router.push(link);
      }
    }

    onMounted(async () => {
      await getDashboard();
    });

    return { dashboard, goTo, tab };
  },
};

// const tasks = ref([
//   {
//     title: 'Implementar tela de login no App',
//     project: 'Projeto: Novo App',
//     priority: { label: 'Alta', color: 'negative' },
//     done: false,
//   },
//   {
//     title: 'Criar layout dos posts',
//     project: 'Projeto: Marketing',
//     priority: { label: 'Média', color: 'warning' },
//     done: true,
//   },
//   {
//     title: 'Revisar documentação da API',
//     project: 'Projeto: Sistema Legado',
//     priority: { label: 'Baixa', color: 'positive' },
//     done: false,
//   },
// ]);

// const notifications = ref([
//   {
//     id: 1,
//     icon: 'mdi-comment',
//     text: 'Ana comentou na sua tarefa.',
//     time: '5 min atrás',
//     color: 'primary',
//   },
//   {
//     id: 2,
//     icon: 'mdi-file-check',
//     text: 'O projeto "Marketing Digital" foi concluído.',
//     time: '1 hora atrás',
//     color: 'positive',
//   },
//   {
//     id: 3,
//     icon: 'mdi-calendar-alert',
//     text: 'Prazo da tarefa "Revisar API" se aproxima.',
//     time: '3 horas atrás',
//     color: 'warning',
//   },
// ]);
</script>

<style lang="scss" scoped>
.summary-card {
  border-left: 4px solid var(--q-color-primary);
  border-radius: 8px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
</style>
