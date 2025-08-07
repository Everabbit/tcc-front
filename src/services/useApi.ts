import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { ResponseI } from 'src/models/response.model';

export function useApi() {
  const $q = useQuasar();
  const loading = ref(false);

  async function handleApi<T>(
    apiCall: () => Promise<ResponseI>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      hideSucessMessage?: boolean;
      hideErrorMessage?: boolean;
    } = {},
  ): Promise<T | null> {
    loading.value = true;
    $q.loading.show();
    try {
      const response = await apiCall();
      if (!response.success) {
        throw new Error(response.message);
      }
      if (options.successMessage && !options.hideSucessMessage) {
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
      loading.value = false;
      $q.loading.hide();
    }
  }

  return { handleApi, loading };
}
