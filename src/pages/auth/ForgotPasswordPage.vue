<template>
  <q-page class="flex flex-center">
    <q-card
      :flat="$q.dark.isActive"
      class="row flex items-stretch justify-center q-ma-md"
      style="min-width: 60vw"
    >
      <div class="col-md-6 col-lg-6 col-xl-6 q-pa-lg flex flex-center">
        <q-card flat v-if="!emailSended">
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Esqueceu sua senha?</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center"
              >Informe seu e-mail para receber um link de recuperação de senha.</span
            >
          </q-card-section>
          <q-card-section>
            <q-form @submit="handleForgotPassword" ref="form">
              <q-input
                filled
                label="Email"
                label-color="white"
                v-model="userEmail"
                type="email"
                class="q-my-sm"
                :rules="[required('Email'), email]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-email" />
                </template>
              </q-input>
              <q-btn
                class="full-width q-my-md"
                icon="mdi-lock-reset"
                label="Redefinir Senha"
                color="primary"
                type="submit"
              />
            </q-form>
          </q-card-section>
          <q-card-section class="text-center">
            <span
              >Sabe sua senha?
              <router-link to="/" style="text-decoration: none">Faça login aqui</router-link></span
            >
          </q-card-section>
        </q-card>
        <q-card flat v-else>
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Email enviado!</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center"
              >Verifique sua caixa de entrada e siga as instruções para alterar sua senha.</span
            >
          </q-card-section>
          <q-card-section class="text-center">
            <q-icon name="mdi-email-check-outline" size="100px" color="primary" />
          </q-card-section>
          <q-card-section class="text-center">
            <span
              >Lembrou a senha?
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
import { required, email } from '../../utils/validation';
import { ref } from 'vue';
import { useApi } from 'src/services/useApi';
import UserService from 'src/services/user.service';

export default {
  setup(props) {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const form = ref<QForm>(null);
    const emailSended = ref<boolean>(false);

    const handleForgotPassword = async (): Promise<void> => {
      const isValid: boolean = await form.value.validate();
      if (isValid) {
        await handleApi(() => UserService.changePasswordRequest(userEmail.value), {
          successMessage: 'Email de recuperação enviado com sucesso!',
          errorMessage: 'Ocorreu um erro ao enviar o email de recuperação.',
        });

        emailSended.value = true;
      } else {
        $q.notify({
          type: 'negative',
          message: 'Corrija os erros no formulário',
        });
      }
    };

    const userEmail = ref<string>('');

    return {
      userEmail,
      required,
      email,
      form,
      handleForgotPassword,
      emailSended,
    };
  },
};
</script>
