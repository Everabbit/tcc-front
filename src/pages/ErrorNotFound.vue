<template>
  <div class="fullscreen text-center q-pa-md flex flex-center">
    <div>
      <q-icon name="mdi-emoticon-sad-outline" size="100px" />
      <div class="text-h1 text-weight-bold q-mt-md" style="font-size: 15vh">404</div>

      <div class="text-h4 q-mt-md" style="opacity: 0.7">Oops. Nada por aqui...</div>

      <p class="text-subtitle1 q-mt-sm">A página que você está procurando não foi encontrada.</p>

      <q-btn
        class="q-mt-xl"
        color="primary"
        unelevated
        to="/p/dashboard"
        label="Voltar para o Início"
        no-caps
        size="lg"
      />
    </div>
  </div>
</template>
