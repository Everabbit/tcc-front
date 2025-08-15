<template>
  <q-page class="flex flex-center">
    <q-card
      :flat="$q.dark.isActive"
      class="row flex items-stretch justify-center q-ma-md"
      style="min-width: 60vw"
    >
      <div class="col-md-6 col-lg-6 col-xl-6 q-pa-lg flex flex-center">
        <q-card flat>
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Solicitação de nova conta</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center"
              >Preencha o seu e-mail abaixo para criar sua conta</span
            >
          </q-card-section>
          <q-card-section>
            <q-form @submit="createAccount" ref="form">
              <q-input
                filled
                label="Email"
                label-color="white"
                v-model="user.email"
                type="email"
                class="q-my-sm"
                :rules="[required('Email'), email]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-email" />
                </template>
              </q-input>
              <q-checkbox
                v-model="check"
                label="Eu concordo em receber e-mails de confirmação do sistema."
              ></q-checkbox>
              <div v-if="!check && checkVerify" class="text-negative q-ml-md">
                É necessário aceitar os e-mails para continuar!
              </div>
              <q-btn
                class="full-width q-my-md"
                icon="mdi-account-plus"
                label="Criar Conta"
                color="primary"
                type="submit"
              />
            </q-form>
          </q-card-section>
          <q-card-section class="text-center">
            <span
              >Já tem um conta?
              <router-link to="/" style="text-decoration: none">Faça login aqui</router-link></span
            >
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6" v-if="$q.screen.md || $q.screen.lg || $q.screen.xl">
        <q-img
          src="../assets/auth_image.png"
          class="rounded-borders"
          height="100%"
          style="position: relative"
        >
          <div class="absolute-full flex text-center justify-center column">
            <span class="text-h6">Gerencie seus projetos com eficiência</span>
            <span class="text-body1 text-weight-light text-center q-mt-md q-px-xl"
              >Organize tarefas, colabore com equipes e acompanhe o progresso de seus projetos em um
              só lugar.</span
            >
          </div>
        </q-img>
      </div>
    </q-card>
  </q-page>
</template>

<script lang="ts">
import type { QForm } from 'quasar';
import { useQuasar } from 'quasar';
import {
  required,
  email,
  minLength,
  passwordMatch,
  checkboxRequired,
  username,
} from '../utils/validation';
import type { UserRegisterI } from 'src/models/user.model';
import { ref } from 'vue';
import UserService from 'src/services/user.service';
import { clone } from 'src/utils/transform';
import { useRouter } from 'vue-router';
import { useApi } from 'src/services/useApi';
import { useAuthStore } from 'src/stores/authStore';
import { AuthI } from 'src/models/auth.model';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const authStore = useAuthStore();
    const { handleApi } = useApi();
    const form = ref<QForm>(null);
    const user = ref<UserRegisterI>({
      fullName: '',
      email: '',
      username: '',
      password: '',
    });
    const check = ref<boolean>(false);
    const checkVerify = ref<boolean>(false);
    const confirmPassowrd = ref<string>('');
    const isPasswordVisible = ref(false);
    const isConfirmPasswordVisible = ref(false);

    function togglePasswordVisibility() {
      isPasswordVisible.value = !isPasswordVisible.value;
    }

    function toggleConfirmPasswordVisibility() {
      isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
    }

    async function createAccount(): Promise<void> {
      const isValid: boolean = await form.value.validate();

      if (isValid && check.value) {
        checkVerify.value = false;
        const data = await handleApi<AuthI>(() => UserService.register(clone(user.value)), {
          successMessage: 'Conta criada com sucesso!',
          errorMessage: 'Ocorreu um erro ao criar a conta.',
        });
        const token: string = data.accessToken;
        authStore.setToken(token);
        router.push('/p/dashboard');
      } else {
        checkVerify.value = true;
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
      }
    }

    return {
      user,
      check,
      required,
      email,
      minLength,
      passwordMatch,
      checkboxRequired,
      confirmPassowrd,
      createAccount,
      form,
      checkVerify,
      username,
      isPasswordVisible,
      togglePasswordVisibility,
      isConfirmPasswordVisible,
      toggleConfirmPasswordVisibility,
    };
  },
};
</script>
