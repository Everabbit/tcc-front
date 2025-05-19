<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Toolbar superior -->
    <q-header elevated class="bg-dark text-grey-8">
      <q-toolbar style="min-height: 56px">
        <q-btn
          flat
          dense
          round
          color="white"
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="mdi-menu"
        />

        <q-toolbar-title class="q-py-sm text-white"> TaskForge </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Drawer esquerdo -->

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="250" class="text-white">
      <!-- Logo e Cabeçalho -->
      <q-scroll-area class="fit">
        <div class="q-pa-sm q-mb-md">
          <div class="sidebar-header q-px-md q-py-sm">
            <div class="sidebar-logo row items-center">
              <q-icon name="mdi-fireplace" size="28px" color="primary" />
              <span class="text-h5 text-weight-medium q-ml-sm text-primary">TaskForge</span>
              <q-btn
                v-if="$q.screen.xs || $q.screen.sm"
                icon="mdi-close"
                size="20px"
                @click="leftDrawerOpen = false"
                flat
                dense
              />
            </div>
          </div>
          <q-separator></q-separator>

          <!-- Itens do Menu -->
          <q-list padding class="sidebar-nav">
            <q-item
              clickable
              v-ripple
              exact
              class="q-mb-xs"
              :class="{ 'active-menu-item': $route.path === '/' }"
            >
              <q-item-section avatar>
                <q-icon name="mdi-view-dashboard" />
              </q-item-section>
              <q-item-section>Dashboard</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              exact
              class="q-mb-xs"
              :class="{ 'active-menu-item': $route.path === '/projects' }"
            >
              <q-item-section avatar>
                <q-icon name="mdi-folder-multiple" />
              </q-item-section>
              <q-item-section>Projetos</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              exact
              class="q-mb-xs"
              :class="{ 'active-menu-item': $route.path === '/tasks' }"
            >
              <q-item-section avatar>
                <q-icon name="mdi-format-list-checks" />
              </q-item-section>
              <q-item-section>Minhas Tarefas</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              exact
              class="q-mb-xs"
              :class="{ 'active-menu-item': $route.path === '/settings' }"
            >
              <q-item-section avatar>
                <q-icon name="mdi-cog" />
              </q-item-section>
              <q-item-section>Configurações</q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Rodapé com Perfil do Usuário -->
        <div class="sidebar-footer absolute-bottom q-pa-md">
          <div class="user-profile row items-center">
            <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm">JD</q-avatar>
            <div>
              <div class="text-weight-medium">John Doe</div>
              <small class="text-grey-5">Admin</small>
            </div>
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { ResponseI } from 'src/models/response.model';
import UserService from 'src/services/user.service';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const leftDrawerOpen = ref(false);

    async function validateToken(): Promise<void> {
      try {
        const response: ResponseI = await UserService.validateToken();

        if (!response.sucess) {
          throw Error(response.message);
        }
        console.log(response.message);
      } catch (error) {
        console.error('Erro:', error);
        router.push('/');
        $q.notify({
          type: 'negative',
          message: 'Ocorreu um erro ao logar no sistema',
        });
      }
    }
    async function getBasicInfo(): Promise<void> {
      try {
        const response: ResponseI = await UserService.getBasicUser();

        if (!response.sucess) {
          throw Error(response.message);
        }
        console.log(response);
      } catch (error) {
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: 'Ocorreu um erro ao buscar informações do usuário',
        });
      }
    }

    onMounted(async () => {
      await validateToken();
      await getBasicInfo();
    });
    return { leftDrawerOpen };
  },
};
</script>
