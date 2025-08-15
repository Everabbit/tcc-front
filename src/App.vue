<template>
  <router-view />
</template>

<script lang="ts">
import { watch } from 'vue';
import { useAuthStore } from './stores/authStore';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    watch(
      () => authStore.isAuthenticated,
      (isAuthenticated, wasAuthenticated) => {
        if (wasAuthenticated && !isAuthenticated) {
          router.push('/');
        }
      },
    );
    return {};
  },
};
</script>
