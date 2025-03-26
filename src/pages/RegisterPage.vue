<template>
  <q-page class="flex flex-center">
    <q-card flat class="row justify-center" style="min-width: 50vw">
      <div class="col-6 q-pa-lg">
        <q-card flat>
          <q-card-section>
            <span class="text-primary flex justify-center items-center text-h5">
              <q-icon size="lg" name="mdi-fireplace" class="q-mr-md" /> <b>TaskForge</b>
            </span>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-img src="../assets/auth_image.png" class="rounded-borders" style="position: relative">
          <div class="absolute-full flex items-center justify-center column">
            <span class="text-white text-h6">Gerencie seus projetos com eficiência</span>
            <span class="text-white text-body1 text-weight-light text-center q-mt-md q-px-xl"
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
import { ref } from 'vue';

export default {
  setup() {
    const nome = ref<string>('');
    const email = ref<string>('');
    const senha = ref<string>('');
    const confirmarSenha = ref<string>('');
    return {
      nome,
      email,
      senha,
      confirmarSenha,
    };
  },
};
</script>
