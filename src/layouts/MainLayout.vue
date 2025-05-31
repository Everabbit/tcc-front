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

        <q-toolbar-title class="q-py-sm text-white"> {{ $route.name }} </q-toolbar-title>
        <q-space />
        <q-btn
          v-if="button.button"
          class="new-project-btn hover-lift"
          dense
          unelevated
          padding="5px 10px"
          color="primary"
          @click="clickButton"
        >
          <q-icon name="mdi-plus" size="15px" class="q-mr-sm" />
          <span style="font-size: 15px">Novo Projeto</span>
        </q-btn>
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
            <div v-for="item in menuList" :key="item.id">
              <q-item
                clickable
                v-ripple
                exact
                class="q-mb-xs"
                :class="{ 'active-menu-item': $route.path === item.link }"
                :to="item.link"
              >
                <q-item-section avatar>
                  <q-icon :name="item.icon" />
                </q-item-section>
                <q-item-section>{{ item.title }}</q-item-section>
              </q-item>
            </div>
          </q-list>
        </div>

        <!-- Rodapé com Perfil do Usuário -->
        <div class="sidebar-footer absolute-bottom q-pa-md">
          <q-item class="user-profile row items-center q-pa-none">
            <!-- Adicione min-width: 0 -->
            <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm">
              <img v-if="userBasic.image" :src="userBasic.image" />
              <span v-else>{{ userBasic.initials }}</span>
            </q-avatar>
            <div class="col self-stretch column justify-center">
              <!-- Container ajustado -->
              <div class="text-weight-medium text-truncate">{{ userBasic.fullName }}</div>
              <small class="text-grey-5 text-truncate">
                {{ userBasic.username || userBasic.email }}
              </small>
            </div>
          </q-item>
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
import { HeaderButtonI } from 'src/models/extra.model';
import { menuBasicList, MenuBasicListI } from 'src/models/menu_list.model';
import { ResponseI } from 'src/models/response.model';
import { UserBasicI } from 'src/models/user.model';
import UserService from 'src/services/user.service';
import emitter from 'src/utils/event_bus';
import { clone } from 'src/utils/transform';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const leftDrawerOpen = ref(false);

    const userBasic = ref<UserBasicI>({
      id: 0,
    });

    const button = computed<HeaderButtonI | null>((): HeaderButtonI | null => {
      const button: HeaderButtonI = clone(router.currentRoute.value.meta);
      return button;
    });

    const menuList = ref<MenuBasicListI[]>(clone(menuBasicList));
    function clickButton(): void {
      emitter.emit(button.value.emitt);
    }

    async function getBasicInfo(): Promise<void> {
      try {
        const response: ResponseI = await UserService.getBasicUser();

        if (!response.success) {
          throw Error(response.message);
        }
        userBasic.value = response.data;

        userBasic.value.initials = userBasic.value.username.substring(0, 2).toUpperCase();
      } catch (error) {
        console.error('Erro:', error);
        router.push('/');
        $q.notify({
          type: 'negative',
          message: 'Ocorreu um erro ao buscar informações do usuário',
        });
      }
    }

    onMounted(async () => {
      await getBasicInfo();
    });
    return { leftDrawerOpen, userBasic, menuList, button, clickButton };
  },
};
</script>

<style lang="css">
.active-menu-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

/* Estilo específico para o botão Novo Projeto */
.new-project-btn {
  background: var(--primary-color);
  color: var(--text-color);
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.new-project-btn:hover {
  background: var(--light-blue);
  transform: translateY(-2px);
}

.new-project-btn i {
  font-size: 1rem;
}
</style>
