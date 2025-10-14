import { ref, readonly } from 'vue';
import { useQuasar } from 'quasar';
import { ResponseI } from 'src/models/response.model';

const activeRequests = ref(0);

export function useApi() {
  const $q = useQuasar();
  const loading = readonly(activeRequests);

  async function handleApi<T>(
    apiCall: () => Promise<ResponseI>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      hideSucessMessage?: boolean;
      hideErrorMessage?: boolean;
    } = {},
  ): Promise<T | null> {
    if (activeRequests.value === 0) {
      $q.loading.show();
    }
    activeRequests.value++;

    try {
      const response = await apiCall();
      if (!response.success) {
        throw new Error(response.message);
      }
      if (options.successMessage && !options.hideSucessMessage && response.success) {
        $q.notify({ type: 'positive', message: options.successMessage });
      }
      return response.data as T;
    } catch (error: any) {
      console.error('Erro na API:', error);
      if (!options.hideErrorMessage) {
        $q.notify({
          type: 'negative',
          message: error.message || options.errorMessage || 'Ocorreu um erro.',
        });
      }

      return null;
    } finally {
      activeRequests.value--;
      if (activeRequests.value === 0) {
        $q.loading.hide();
      }
    }
  }

  return { handleApi, loading };
}
