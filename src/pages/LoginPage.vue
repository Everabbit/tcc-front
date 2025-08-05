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
                type="password"
                class="q-my-sm"
                :rules="[required('Senha'), minLength('Senha', 8)]"
              >
                <template v-slot:prepend>
                  <q-icon name="mdi-lock" />
                </template>
              </q-input>
              <div class="text-right">
                <span>Esqueceu a senha?</span>
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
              <span v-else>{{ userBasic.initials }}</span>
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
import type { UserBasicI, UserLoginI } from 'src/models/user.model';
import { onMounted, ref } from 'vue';
import { ResponseI } from 'src/models/response.model';
import UserService from 'src/services/user.service';
import { clone } from 'src/utils/transform';
import { setHttpToken } from 'src/services/api';
import { useRouter } from 'vue-router';
import { getUsernameInitials } from 'src/utils/utils';
import { getUserBasicInfo, setUserBasicInfo } from 'src/utils/user.utils';

export default {
  setup() {
    const $q = useQuasar();
    const router = useRouter();
    const form = ref<QForm>(null);
    const user = ref<UserLoginI>({
      email: '',
      password: '',
    });

    const logged = ref<boolean>(false);
    const userBasic = ref<UserBasicI>({
      id: 0,
    });

    async function acessAccount(): Promise<void> {
      try {
        const isValid = await form.value.validate();

        if (isValid) {
          const response: ResponseI = await UserService.login(clone(user.value));

          if (!response.success) {
            throw Error(response.message);
          }

          const token: string = response.data;

          setHttpToken(token);

          const userResponse: ResponseI = await UserService.getBasicUser();

          if (!userResponse.success) {
            throw Error(userResponse.message);
          }

          userBasic.value = userResponse.data;
          userBasic.value.initials = getUsernameInitials(userBasic.value.username);
          setUserBasicInfo(userBasic.value);
          logged.value = true;

          $q.notify({
            type: 'positive',
            message: 'Login realizado com sucesso!',
          });

          router.push('/p/dashboard');
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

    async function logoutAccount(): Promise<void> {
      try {
        setHttpToken('');

        logged.value = false;
      } catch (error) {
        console.error('Erro:', error);
        $q.notify({
          type: 'negative',
          message: 'Ocorreu um erro ao deslogar do sistema',
        });
      }
    }

    async function getBasicInfo(): Promise<void> {
      try {
        const userResponse: UserBasicI = await getUserBasicInfo();

        if (!userResponse) {
          const response: ResponseI = await UserService.getBasicUser();
          if (!response.success) {
            throw Error(response.message);
          }

          userBasic.value = response.data;
          userBasic.value.initials = getUsernameInitials(userBasic.value.username);
          setUserBasicInfo(userBasic.value);
        } else {
          userBasic.value = userResponse;
        }
        logged.value = true;
      } catch (error) {
        logged.value = false;
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
    };
  },
};
</script>
