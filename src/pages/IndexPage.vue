<template>
  <q-page padding>
    <!-- <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in stats" :key="stat.title">
        <q-card class="summary-card" flat bordered>
          <q-card-section>
            <div class="row items-start justify-between">
              <div class="col">
                <div class="text-caption text-grey-7">{{ stat.title }}</div>
                <div class="text-h5 text-weight-bolder">{{ stat.value }}</div>
              </div>
              <q-icon :name="stat.icon" :color="stat.color" size="2rem" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-xl">
      <div class="col-12 col-lg-8">
        <div class="row items-center justify-between q-mb-md">
          <h2 class="text-h5 text-weight-bold">Meus Projetos</h2>
          <q-btn unelevated color="primary" label="Novo Projeto" icon="add" />
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6" v-for="project in projects" :key="project.title">
            <q-card class="project-card" flat bordered>
              <q-card-section>
                <div class="text-weight-bold text-subtitle1">{{ project.title }}</div>
                <div class="text-caption text-grey-7 q-mb-sm">{{ project.description }}</div>

                <div class="q-mb-xs">
                  <div class="row justify-between text-caption text-grey">
                    <span>Progresso</span>
                    <span>{{ project.progress }}%</span>
                  </div>
                  <q-linear-progress :value="project.progress / 100" color="primary" rounded />
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="row items-center justify-between">
                <div class="text-caption text-grey-7">
                  <q-icon name="event" class="q-mr-xs" />
                  Prazo: {{ project.deadline }}
                </div>
                <q-avatar-group>
                  <q-avatar
                    v-for="member in project.team"
                    :key="member"
                    size="sm"
                    color="primary"
                    text-color="white"
                    >{{ member }}</q-avatar
                  >
                </q-avatar-group>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <q-card flat bordered>
          <q-tabs
            v-model="tab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="tasks" label="Minhas Tarefas" />
            <q-tab name="notifications" label="Notificações" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="tasks">
              <q-list>
                <q-card v-for="task in tasks" :key="task.title" class="q-mb-sm" flat bordered>
                  <q-card-section>
                    <div class="row items-center no-wrap">
                      <q-checkbox v-model="task.done" color="primary" class="q-mr-sm" />
                      <div class="col">
                        <div :class="{ 'text-strike': task.done, 'text-grey-7': task.done }">
                          {{ task.title }}
                        </div>
                        <div class="text-caption">{{ task.project }}</div>
                      </div>
                      <q-badge
                        :color="task.priority.color"
                        :label="task.priority.label"
                        class="q-ml-sm"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </q-list>
            </q-tab-panel>

            <q-tab-panel name="notifications">
              <q-list separator>
                <q-item v-for="notification in notifications" :key="notification.id">
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
                </q-item>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div> -->
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const tab = ref('tasks');

const stats = ref([
  { title: 'PROJETOS ATIVOS', value: '12', icon: 'mdi-folder-multiple', color: 'primary' },
  { title: 'TAREFAS CONCLUÍDAS', value: '87', icon: 'mdi-check-circle', color: 'positive' },
  { title: 'PROGRESSO GERAL', value: '76%', icon: 'mdi-chart-donut', color: 'warning' },
  { title: 'PRAZOS PRÓXIMOS', value: '3', icon: 'mdi-calendar-clock', color: 'negative' },
]);

const projects = ref([
  {
    title: 'Desenvolvimento do Novo App',
    description: 'App de e-commerce para dispositivos móveis.',
    progress: 60,
    deadline: '30/11/2023',
    team: ['A', 'B', 'C'],
  },
  {
    title: 'Marketing Digital',
    description: 'Campanha para o lançamento do novo produto.',
    progress: 90,
    deadline: '15/10/2023',
    team: ['D', 'E'],
  },
  {
    title: 'Atualização do Sistema Legado',
    description: 'Refatoração e migração de banco de dados.',
    progress: 40,
    deadline: '20/12/2023',
    team: ['F', 'G', 'H'],
  },
  {
    title: 'Rebranding da Marca',
    description: 'Criação da nova identidade visual da empresa.',
    progress: 75,
    deadline: '01/11/2023',
    team: ['I', 'J'],
  },
]);

const tasks = ref([
  {
    title: 'Implementar tela de login no App',
    project: 'Projeto: Novo App',
    priority: { label: 'Alta', color: 'negative' },
    done: false,
  },
  {
    title: 'Criar layout dos posts',
    project: 'Projeto: Marketing',
    priority: { label: 'Média', color: 'warning' },
    done: true,
  },
  {
    title: 'Revisar documentação da API',
    project: 'Projeto: Sistema Legado',
    priority: { label: 'Baixa', color: 'positive' },
    done: false,
  },
]);

const notifications = ref([
  {
    id: 1,
    icon: 'mdi-comment',
    text: 'Ana comentou na sua tarefa.',
    time: '5 min atrás',
    color: 'primary',
  },
  {
    id: 2,
    icon: 'mdi-file-check',
    text: 'O projeto "Marketing Digital" foi concluído.',
    time: '1 hora atrás',
    color: 'positive',
  },
  {
    id: 3,
    icon: 'mdi-calendar-alert',
    text: 'Prazo da tarefa "Revisar API" se aproxima.',
    time: '3 horas atrás',
    color: 'warning',
  },
]);
</script>

<style lang="scss" scoped>
.summary-card {
  border-left: 4px solid var(--q-color-primary);
  border-radius: 8px;
}

.project-card {
  transition:
    box-shadow 0.3s,
    transform 0.3s;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-4px);
  }
}
</style>
