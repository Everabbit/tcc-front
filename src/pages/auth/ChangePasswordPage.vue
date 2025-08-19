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
            <span class="text-h4 text-center text-bold">Alterar Senha</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center"
              >Preencha os campos abaixo para alterar sua senha</span
            >
          </q-card-section>
          <q-card-section>
            <q-form @submit="changePassword" ref="form">
              <q-input
                filled
                label="Senha"
                label-color="white"
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                class="q-my-sm"
                :rules="[required('Senha'), minLength('Senha', 8)]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                    class="cursor-pointer"
                    @click="togglePasswordVisibility"
                  />
                </template>
              </q-input>
              <q-input
                filled
                label="Confirmar senha"
                label-color="white"
                v-model="confirmPassword"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                class="q-my-sm"
                :rules="[
                  required('Confirmação de senha'),
                  passwordMatch(password, confirmPassword),
                  minLength('Senha', 8),
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="isConfirmPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
                    class="cursor-pointer"
                    @click="toggleConfirmPasswordVisibility"
                  />
                </template>
              </q-input>
              <q-btn
                class="full-width q-my-md"
                icon="mdi-account-plus"
                label="Alterar Senha"
                color="primary"
                type="submit"
              />
            </q-form>
          </q-card-section>
          <q-card-section class="text-center">
            <span
              >Lembrou sua Senha?
              <router-link to="/" style="text-decoration: none">Faça login aqui</router-link></span
            >
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6" v-if="$q.screen.md || $q.screen.lg || $q.screen.xl">
        <q-img
          src="../../assets/auth_image.png"
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
} from '../../utils/validation';
import type { PasswordChangeI, UserRegisterI } from 'src/models/user.model';
import { onMounted, ref } from 'vue';
import UserService from 'src/services/user.service';
import { clone } from 'src/utils/transform';
import { useRouter } from 'vue-router';
import { useApi } from 'src/services/useApi';
import { useAuthStore } from 'src/stores/authStore';
import { AuthI } from 'src/models/auth.model';
import { EmailRequestI } from 'src/models/email_request.model';

export default {
  props: {
    token: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const router = useRouter();
    const { handleApi } = useApi();
    const form = ref<QForm>(null);
    const password = ref<string>('');
    const confirmPassword = ref<string>('');
    const isPasswordVisible = ref(false);
    const isConfirmPasswordVisible = ref(false);

    function togglePasswordVisibility() {
      isPasswordVisible.value = !isPasswordVisible.value;
    }

    function toggleConfirmPasswordVisibility() {
      isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value;
    }

    async function changePassword(): Promise<void> {
      const isValid: boolean = await form.value.validate();

      if (isValid) {
        await handleApi(() => UserService.changePassword(password.value, props.token), {
          successMessage: 'Senha alterada com sucesso!',
          errorMessage: 'Ocorreu um erro ao alterar a senha.',
        });

        router.push('/');
      } else {
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
      }
    }

    return {
      required,
      minLength,
      passwordMatch,
      confirmPassword,
      form,
      isPasswordVisible,
      togglePasswordVisibility,
      isConfirmPasswordVisible,
      toggleConfirmPasswordVisibility,
      changePassword,
      password,
    };
  },
};
</script>
