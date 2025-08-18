<template>
  <q-page class="flex flex-center">
    <q-card
      :flat="$q.dark.isActive"
      class="row flex items-stretch justify-center q-ma-md"
      style="min-width: 60vw"
    >
      <div v-if="!logged" class="col-md-6 col-lg-6 col-xl-6 q-pa-lg flex flex-center">
        <q-card flat class="full-width">
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Bem-vindo de volta</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center">Faça login para acessar sua conta</span>
          </q-card-section>
          <q-card-section>
            <q-form @submit="acessAccount" ref="form">
              <q-input
                filled
                label="Email ou nome de usuário"
                label-color="white"
                v-model="user.email"
                type="text"
                class="q-my-sm"
                :rules="[required('Email ou nome de usuário')]"
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
              <div class="text-right">
                <span
                  ><router-link to="/recuperarsenha" style="text-decoration: none"
                    >Esqueceu a senha?</router-link
                  ></span
                >
              </div>
              <q-btn
                class="full-width q-my-md"
                icon="mdi-account-plus"
                label="Entrar"
                color="primary"
                type="submit"
              />
            </q-form>
          </q-card-section>
          <q-card-section class="text-center">
            <span
              >Não tem uma conta?
              <router-link to="/registro" style="text-decoration: none"
                >Cadastre-se aqui</router-link
              ></span
            >
          </q-card-section>
        </q-card>
      </div>
      <div v-else class="col-md-6 col-lg-6 col-xl-6 q-pa-lg flex flex-center">
        <q-card flat class="full-width">
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Bem-vindo(a)</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center">Você já está logado</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-md">
            <q-avatar size="80px" color="primary" text-color="white" class="q-mr-sm">
              <img v-if="userBasic.image" :src="userBasic.image" />
              <span v-else>{{ getUsernameInitials(userBasic.username) }}</span>
            </q-avatar>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center">{{ userBasic.fullName }}</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center">{{
              userBasic.username ? userBasic.username : userBasic.email
            }}</span>
          </q-card-section>
          <q-card-section>
            <q-btn
              class="full-width q-my-sm"
              icon="mdi-login"
              label="Entrar"
              color="primary"
              @click="$router.push('/p/dashboard')"
            />
            <q-btn
              class="full-width"
              icon="mdi-logout"
              label="Sair"
              color="primary"
              @click="logoutAccount"
            />
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
} from '../../utils/validation';
import type { UserBasicI, UserLoginI } from 'src/models/user.model';
import { onMounted, ref } from 'vue';
import UserService from 'src/services/user.service';
import { clone } from 'src/utils/transform';
import { useRouter } from 'vue-router';
import { getUsernameInitials } from 'src/utils/utils';
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
    const user = ref<UserLoginI>({
      email: '',
      password: '',
    });

    const isPasswordVisible = ref(false);

    function togglePasswordVisibility() {
      isPasswordVisible.value = !isPasswordVisible.value;
    }

    const logged = ref<boolean>(false);
    const userBasic = ref<UserBasicI>({
      id: 0,
    });

    async function acessAccount(): Promise<void> {
      const isValid = await form.value.validate();

      if (isValid) {
        const response = await handleApi<AuthI>(() => UserService.login(clone(user.value)), {
          successMessage: 'Login realizado com sucesso!',
          errorMessage: 'Email, nome de usuário ou senha incorretos.',
        });

        if (response) {
          const token: string = response.accessToken;
          authStore.setToken(token);

          const userResponse = await handleApi<UserBasicI>(() => UserService.getBasicUser(), {
            errorMessage: 'Ocorreu um erro ao buscar informações do usuário.',
          });

          if (userResponse) {
            userBasic.value = userResponse;
            logged.value = true;
            router.push('/p/dashboard');
          }
        }
      } else {
        $q.notify({
          type: 'negative',
          message: 'Por favor, corrija os erros no formulário.',
        });
      }
    }

    function logoutAccount(): void {
      authStore.logout();
    }

    async function getBasicInfo(): Promise<void> {
      if (authStore.token) {
        await authStore.fetchUser();
        if (authStore.isAuthenticated) {
          userBasic.value = authStore.getUser as UserBasicI;
          logged.value = true;
        }
      }
    }

    onMounted(async () => {
      await getBasicInfo();
    });

    return {
      user,
      required,
      email,
      minLength,
      passwordMatch,
      checkboxRequired,
      acessAccount,
      form,
      logged,
      userBasic,
      logoutAccount,
      getUsernameInitials,
      isPasswordVisible,
      togglePasswordVisibility,
    };
  },
};
</script>
