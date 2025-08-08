import { createPinia } from 'pinia';
import { boot } from 'quasar/wrappers';
import { Router } from 'vue-router';

// Adiciona a propriedade 'router' aos stores do Pinia
declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router;
  }
}

export default boot(({ app, router }) => {
  const pinia = createPinia();
  pinia.use(({ store }) => {
    store.router = router;
  });
  app.use(pinia);
});
