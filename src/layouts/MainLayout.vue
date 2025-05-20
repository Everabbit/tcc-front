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
          <div class="user-profile row items-center">
            <q-avatar size="40px" color="primary" text-color="white" class="q-mr-sm">
              <img v-if="userBasic.image" :src="userBasic.image" />
              <span v-else>{{ userBasic.initials }}</span>
            </q-avatar>
            <div>
              <div class="text-weight-medium">{{ userBasic.fullName }}</div>
              <small class="text-grey-5">{{
                userBasic.username ? userBasic.username : userBasic.email
              }}</small>
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
import { menuBasicList, MenuBasicListI } from 'src/models/menu_list.model';
import { ResponseI } from 'src/models/response.model';
import { UserBasicI } from 'src/models/user.model';
import UserService from 'src/services/user.service';
import { clone } from 'src/utils/transform';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const leftDrawerOpen = ref(false);

    const userBasic = ref<UserBasicI>({
      id: 0,
    });

    const menuList = ref<MenuBasicListI[]>(clone(menuBasicList));

    async function validateToken(): Promise<void> {
      try {
        const response: ResponseI = await UserService.validateToken();

        if (!response.sucess) {
          throw Error(response.message);
        }
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
        userBasic.value = response.data;

        const nameParts = userBasic.value.fullName.split(' ');
        if (nameParts.length > 1) {
          userBasic.value.initials = (
            nameParts[0].charAt(0) + nameParts[1].charAt(0)
          ).toUpperCase();
        } else {
          userBasic.value.initials = nameParts[0].substring(0, 2).toUpperCase();
        }
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
    return { leftDrawerOpen, userBasic, menuList };
  },
};
</script>

<style lang="css">
.active-menu-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>
