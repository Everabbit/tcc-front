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
                v-model="user.fullName"
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
                label="Nome de usuário"
                label-color="white"
                v-model="user.username"
                type="text"
                class="q-my-sm"
                :rules="[required('Nome de usuário'), username]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-account-circle" />
                </template>
              </q-input>
              <q-input
                filled
                label="Senha"
                label-color="white"
                v-model="user.password"
                type="password"
                class="q-my-sm"
                :rules="[required('Senha'), minLength('Senha', 8)]"
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
                  minLength('Senha', 8),
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-lock" />
                </template>
              </q-input>
              <q-checkbox
                v-model="check"
                label="Eu concordo com os Termos de Serviço e Política de Privacidade"
              ></q-checkbox>
              <div v-if="!check && checkVerify" class="text-negative q-ml-md">
                É necessário aceitar os termos!
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
import { ResponseI } from 'src/models/response.model';
import UserService from 'src/services/user.service';
import { setHttpToken } from 'src/services/api';
import { clone } from 'src/utils/transform';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
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

    async function createAccount(): Promise<void> {
      try {
        // Validação programática
        const isValid: boolean = await form.value.validate();

        if (isValid && check.value) {
          checkVerify.value = false;
          const response: ResponseI = await UserService.register(clone(user.value));

          if (!response.success) {
            throw Error(response.message);
          }

          const token: string = response.data;

          setHttpToken(token);

          router.push('/p/dashboard');
        } else {
          checkVerify.value = true;
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
      checkVerify,
      username,
    };
  },
};
</script>
