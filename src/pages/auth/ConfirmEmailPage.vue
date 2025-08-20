<template>
  <q-page class="flex flex-center">
    <q-card
      :flat="$q.dark.isActive"
      class="row flex items-stretch justify-center q-ma-md"
      style="min-width: 60vw"
    >
      <div class="col-md-6 col-lg-6 col-xl-6 q-pa-lg flex flex-center">
        <q-card flat v-if="sucess">
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Email verificado!</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center">Seu e-mail foi alterado com sucesso!</span>
          </q-card-section>
          <q-card-section class="text-center">
            <q-icon name="mdi-email-check-outline" size="100px" color="primary" />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Ir para o Dashboard" color="primary" to="/p/dashboard" />
          </q-card-actions>
        </q-card>
        <q-card flat v-else>
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-h4 text-center text-bold">Erro na verificação!</span>
          </q-card-section>
          <q-card-section class="flex justify-center q-py-none">
            <span class="text-subtitle1 text-center"
              >Ocorreu um erro ao verificar seu e-mail. Por favor, tente novamente ou entre em
              contato com o suporte.</span
            >
          </q-card-section>
          <q-card-section class="text-center">
            <q-icon name="mdi-email-remove-outline" size="100px" color="negative" />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Voltar para a Configuração" color="primary" to="/p/configuracoes" />
          </q-card-actions>
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
import { onMounted, ref } from 'vue';
import { useApi } from 'src/services/useApi';
import UserService from 'src/services/user.service';

export default {
  props: {
    token: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { handleApi } = useApi();
    const sucess = ref<boolean>(false);

    const verifyEmailChange = async (): Promise<void> => {
      const token = props.token;
      if (token) {
        const data = await handleApi(() => UserService.verifyEmailChange(token), {
          successMessage: 'Email alterado com sucesso!',
          errorMessage: 'Ocorreu um erro ao confirmar a alteração de email.',
        });
        sucess.value = !!data;
      }
    };

    onMounted(() => {
      verifyEmailChange();
    });

    return {
      sucess,
    };
  },
};
</script>
