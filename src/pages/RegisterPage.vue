<template>
  <q-page class="flex flex-center">
    <q-card
      :flat="$q.dark.isActive"
      class="row flex items-stretch justify-center q-ma-md"
      style="min-width: 60vw"
    >
      <div class="col-md-6 col-lg-6 col-xl-6 q-pa-lg">
        <q-card flat>
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Criar nova conta</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center">Preencha os campos abaixo para começar</span>
          </q-card-section>
          <q-card-section>
            <q-form @submit="createAccount" ref="form">
              <q-input
                filled
                label="Digite seu nome completo"
                label-color="white"
                type="text"
                v-model="user.name"
                class="q-my-sm"
                :rules="[required('Nome completo')]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-account" />
                </template>
              </q-input>
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
              <q-input
                filled
                label="Senha"
                label-color="white"
                v-model="user.password"
                type="password"
                class="q-my-sm"
                :rules="[required('Senha')]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-lock" />
                </template>
              </q-input>
              <q-input
                filled
                label="Confirmar senha"
                label-color="white"
                v-model="confirmPassowrd"
                type="password"
                class="q-my-sm"
                :rules="[
                  required('Confirmação de senha'),
                  passwordMatch(user.password, confirmPassowrd),
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-lock" />
                </template>
              </q-input>
              <q-checkbox
                v-model="check"
                label="Eu concordo com os Termos de Serviço e Política de Privacidade"
                :rules="[required('Este campo')]"
              ></q-checkbox>
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
            <span>Já tem um conta? Faça login aqui</span>
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
import { required, email, minLength, passwordMatch, checkboxRequired } from '../utils/validation';
import type { UserRegisterI } from 'src/models/user.model';
import { ref } from 'vue';

export default {
  setup() {
    const $q = useQuasar();
    const form = ref<QForm>(null);
    const user = ref<UserRegisterI>({
      name: '',
      email: '',
      password: '',
    });
    const check = ref<boolean>(false);
    const confirmPassowrd = ref<string>('');

    async function createAccount(): Promise<void> {
      try {
        // Validação programática
        const isValid = await form.value.validate();

        if (isValid) {
          $q.notify({
            type: 'positive',
            message: 'Formulário válido!',
          });
          // Lógica de submissão aqui
        } else {
          $q.notify({
            type: 'negative',
            message: 'Corrija os erros no formulário',
          });
        }
      } catch (error) {
        console.error('Erro na validação:', error);
        $q.notify({
          type: 'negative',
          message: 'Ocorreu um erro ao validar o formulário',
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
    };
  },
};
</script>
