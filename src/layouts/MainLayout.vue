<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Toolbar superior -->
    <q-header elevated :class="$q.dark.isActive ? 'bg-dark' : 'bg-white text-grey-10'">
      <q-toolbar style="min-height: 56px">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="mdi-menu"
        />

        <q-toolbar-title class="q-py-sm"> {{ $route.name }} </q-toolbar-title>
        <q-btn
          v-if="button.button"
          class="new-project-btn hover-lift"
          dense
          unelevated
          color="primary"
          @click="clickButton"
        >
          <q-icon name="mdi-plus" size="15px" class="q-mr-sm" />
          <span style="font-size: 15px">{{ $route.meta.label }}</span>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Drawer esquerdo -->

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="250">
      <!-- Logo e Cabeçalho -->
      <q-scroll-area class="fit">
        <div class="q-pa-sm q-mb-md">
          <div class="sidebar-header q-px-md q-py-sm">
            <div class="full-width row">
              <div class="col-11 row">
                <q-icon name="mdi-fireplace" size="28px" color="primary" />
                <span class="text-h5 text-weight-medium q-ml-sm text-primary">TaskForge</span>
              </div>
              <div class="col-1">
                <q-btn
                  v-if="$q.screen.xs || $q.screen.sm"
                  icon="mdi-close"
                  size="15px"
                  @click="leftDrawerOpen = false"
                  flat
                  dense
                />
              </div>
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
                :class="$route.path.indexOf(item.link) !== -1 ? 'active-menu-item' : ''"
                @click="goToRoute(item.link)"
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
        <div class="sidebar-footer absolute-bottom q-pa-sm">
          <q-item
            v-if="authStore.user"
            clickable
            class="user-profile row items-center"
            @click="goToRoute('/p/configuracoes')"
            :class="{ 'active-menu-item': $route.path.indexOf('configuracoes') > 0 }"
          >
            <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm">
              <img v-if="authStore.user.image" :src="authStore.user.image" />
              <span v-else>{{ getUsernameInitials(authStore.user.username) }}</span>
            </q-avatar>
            <div class="col self-stretch column justify-center">
              <div class="text-weight-medium text-truncate">{{ authStore.user.fullName }}</div>
              <small :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-9' + ' text-truncate'">
                {{ authStore.user.username || authStore.user.email }}
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
import { HeaderButtonI } from 'src/models/extra.model';
import { menuBasicList, MenuBasicListI } from 'src/models/menu_list.model';
import { useApi } from 'src/services/useApi';
import { useAuthStore } from 'src/stores/authStore';
import emitter from 'src/utils/event_bus';
import { clone } from 'src/utils/transform';
import { getUsernameInitials } from 'src/utils/utils';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const leftDrawerOpen = ref(false);

    const button = computed<HeaderButtonI | null>((): HeaderButtonI | null => {
      const button: HeaderButtonI = clone(router.currentRoute.value.meta);
      return button;
    });

    const menuList = ref<MenuBasicListI[]>(clone(menuBasicList));
    function clickButton(): void {
      emitter.emit(button.value.emitt);
    }

    function goToRoute(route: string): void {
      router.push(route);
    }

    return {
      leftDrawerOpen,
      authStore,
      menuList,
      button,
      clickButton,
      goToRoute,
      getUsernameInitials,
    };
  },
};
</script>

<style lang="scss">
.active-menu-item {
  background-color: rgba(109, 109, 109, 0.178);
  border-radius: 8px;

  .q-item__section {
    color: var(--q-primary);
  }
}

.new-project-btn {
  border-radius: var(--border-radius);
  transition: all 0.3s;
}

.new-project-btn:hover {
  transform: translateY(-2px);
}

.new-project-btn i {
  font-size: 1rem;
}
</style>
