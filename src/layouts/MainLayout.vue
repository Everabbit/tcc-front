<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { useQuasar } from 'quasar';
import { ResponseI } from 'src/models/response.model';
import UserService from 'src/services/user.service';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();

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
    onMounted(async () => {
      await validateToken();
    });
    return;
  },
};
</script>
