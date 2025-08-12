<template>
  <q-page padding>
    <q-dialog
      v-model="showConfirmDeleteDialog"
      persistent
      :position="$q.screen.xs ? 'bottom' : 'standard'"
    >
      <q-card style="width: 400px">
        <q-card-section class="row items-center">
          <q-avatar icon="mdi-alert-outline" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Você tem certeza?</span>
        </q-card-section>
        <q-card-section>
          <p>
            Esta ação é irreversível. Todos os seus projetos, tarefas e dados associados serão
            permanentemente excluídos. Por favor, digite
            <strong>{{ user.username }}</strong> para confirmar.
          </p>
          <q-input v-model="deleteConfirmationText" label="Confirmação" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn
            label="Excluir Permanentemente"
            color="negative"
            :disable="deleteConfirmationText !== user.username"
            @click="confirmDeleteAccount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showColorDialog" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <q-card style="width: 350px">
        <q-card-section>
          <div class="text-h6">Escolha uma cor para o tema</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-gutter-md justify-center">
            <div v-for="color in themeColorOptions" :key="color.value">
              <q-btn
                round
                size="lg"
                :style="{ backgroundColor: getHexColor(color.value) }"
                @click="selectThemeColor(color.value)"
              >
                <q-tooltip>{{ color.name }}</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showChangePasswordDialog" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">Alterar Senha</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="changePassword" ref="passwordform">
            <q-input
              label="Senha Atual"
              v-model="passwordData.currentPassword"
              type="password"
              outlined
              dense
              class="q-mb-md"
              :rules="[required('Senha Atual')]"
            />
            <q-input
              label="Nova Senha"
              v-model="passwordData.newPassword"
              type="password"
              outlined
              dense
              class="q-mb-md"
              :rules="[required('Nova Senha'), minLength('Nova Senha', 8)]"
            />
            <q-input
              label="Confirmar Nova Senha"
              v-model="passwordData.newPasswordConfirm"
              type="password"
              outlined
              dense
              class="q-mb-md"
              :rules="[
                required('Confirmar Nova Senha'),
                passwordMatch(passwordData.newPassword, passwordData.newPasswordConfirm),
              ]"
            />
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="primary" v-close-popup />
              <q-btn label="Alterar Senha" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8" style="max-width: 1000px">
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6">Perfil</div>
          </q-card-section>
          <q-list bordered separator>
            <q-item class="q-py-md">
              <q-item-section avatar>
                <q-avatar size="60px" color="primary" text-color="white" class="q-mr-sm">
                  <img v-if="user.image" :src="user.image" alt="Foto de Perfil" />
                  <span v-else>{{ getUsernameInitials(user.username) }}</span>
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>Foto de Perfil</q-item-label>
                <q-item-label caption> Use uma imagem com boa resolução. </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-file
                  v-model="avatarFile"
                  label="Escolher imagem"
                  outlined
                  dense
                  class="hidden"
                  ref="fileInputRef"
                  accept="image/*"
                  @update:model-value="handleAvatarUpload"
                />
                <q-btn
                  :label="$q.screen.xs ? '' : !user.image ? 'Adicionar Foto' : 'Alterar Foto'"
                  icon="mdi-camera"
                  color="primary"
                  outline
                  @click="fileInputRef.pickFiles()"
                />
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="user.image"
                  icon="mdi-delete-outline"
                  color="negative"
                  outline
                  @click="removeAvatar"
                />
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label>Nome de Usuário</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-input dense outlined v-model="user.username" />
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label>Nome Completo</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-input dense outlined v-model="user.fullName" />
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label>Email</q-item-label>
              </q-item-section>
              <q-item-section>
                <q-input dense outlined v-model="user.email" type="email" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn label="Salvar Alterações" color="primary" @click="saveProfile" />
          </q-card-actions>
        </q-card>

        <!-- abrir dialog de troca de senha -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6">Segurança</div>
          </q-card-section>
          <q-list bordered separator>
            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label>Senha</q-item-label>
                <q-item-label caption> Altere sua senha. </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  label="Alterar Senha"
                  color="primary"
                  outline
                  @click="showChangePasswordDialog = true"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6">Aparência</div>
          </q-card-section>
          <q-list bordered separator>
            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label>Tema Escuro</q-item-label>
                <q-item-label caption>Alterne entre o modo claro e escuro.</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle
                  v-model="isDarkMode"
                  size="lg"
                  checked-icon="mdi-weather-night"
                  unchecked-icon="mdi-white-balance-sunny"
                />
              </q-item-section>
            </q-item>

            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label>Cor Principal</q-item-label>
                <q-item-label caption>
                  Escolha a cor principal para o tema da aplicação.
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  round
                  icon="mdi-palette"
                  :style="{ backgroundColor: themeColor, color: 'white' }"
                  @click="showColorDialog = true"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6">Sessão</div>
          </q-card-section>
          <q-list bordered separator>
            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label>Sair</q-item-label>
                <q-item-label caption>
                  Encerre sua sessão atual. Você precisará fazer login novamente para acessar sua
                  conta.
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn label="Sair" color="negative" outline @click="logout" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card class="danger-zone-card">
          <q-card-section>
            <div class="text-h6">Zona de Risco</div>
          </q-card-section>
          <q-list bordered separator>
            <q-item class="q-py-md">
              <q-item-section>
                <q-item-label class="text-negative">Excluir Conta</q-item-label>
                <q-item-label caption>
                  Esta ação não pode ser desfeita. Você perderá todos os seus dados.
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  label="Excluir Minha Conta"
                  color="negative"
                  @click="showConfirmDeleteDialog = true"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { colors, QFile, QForm, useQuasar } from 'quasar';
import { PasswordChangeI, UserI, UserPreferencesI } from 'src/models/user.model';
import { useApi } from 'src/services/useApi';
import UserService from 'src/services/user.service';
import { useAuthStore } from 'src/stores/authStore';
import { useSettingsStore } from 'src/stores/settingsStore';
import { clone } from 'src/utils/transform';
import { getUsernameInitials } from 'src/utils/utils';
import { minLength, passwordMatch, required } from 'src/utils/validation';
import { computed, onMounted, ref, watch } from 'vue';

export default {
  setup() {
    const $q = useQuasar();
    const { handleApi } = useApi();
    const authStore = useAuthStore();
    const settingsStore = useSettingsStore();
    const avatarFile = ref<File | null>(null);
    const fileInputRef = ref<QFile | null>(null);
    const user = ref<UserI>({
      fullName: '',
      email: '',
      password: '',
    });
    const showConfirmDeleteDialog = ref<boolean>(false);
    const deleteConfirmationText = ref<string>('');

    const passwordform = ref<QForm>(null);
    const showChangePasswordDialog = ref<boolean>(false);
    const passwordData = ref<PasswordChangeI>({
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: '',
    });

    const isDarkMode = computed({
      get: () => settingsStore.settings?.darkMode ?? false,
      set: (newValue: boolean) => {
        settingsStore.updateDarkMode(newValue);
      },
    });

    const themeColor = computed({
      get: () => settingsStore.settings?.theme ?? 'primary',
      set: (newValue: string) => {
        settingsStore.updateThemeColor(newValue);
      },
    });

    const showColorDialog = ref(false);

    const themeColorOptions = ref([
      { name: 'Azul', value: 'blue-7' },
      { name: 'Verde', value: 'green-7' },
      { name: 'Laranja', value: 'orange-8' },
      { name: 'Roxo', value: 'deep-purple-6' },
      { name: 'Ciano', value: 'cyan-6' },
      { name: 'Vermelho', value: 'red-6' },
      { name: 'Rosa', value: 'pink-5' },
      { name: 'Teal', value: 'teal-6' },
      { name: 'Cinza Azulado', value: 'blue-grey-7' },
    ]);

    const selectThemeColor = (color: string) => {
      themeColor.value = getHexColor(color);
      showColorDialog.value = false;
    };

    const getHexColor = (colorName: string) => {
      const color = colors.getPaletteColor(colorName);
      return color;
    };

    async function getUser(): Promise<void> {
      const userResponse = await handleApi<UserI>(() => UserService.getUserConfig(), {
        errorMessage: 'Ocorreu um erro ao buscar informações do usuário.',
      });

      if (userResponse) {
        user.value = userResponse;
      }
    }

    async function handleAvatarUpload(file: File): Promise<void> {
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      const response = await handleApi<UserI>(() => UserService.updateImage(formData), {
        errorMessage: 'Ocorreu um erro ao fazer upload da imagem.',
        successMessage: 'Imagem de perfil atualizada com sucesso!',
      });

      if (response) {
        user.value.image = response.image;
      }
    }

    async function removeAvatar(): Promise<void> {
      if (!user.value.image) return;
      $q.dialog({
        title: 'Confirmação',
        message: 'Tem certeza de que deseja remover sua foto de perfil?',
        cancel: true,
        persistent: true,
      })
        .onOk(async () => {
          await handleApi(() => UserService.removeImage(), {
            errorMessage: 'Ocorreu um erro ao remover a imagem.',
            successMessage: 'Imagem de perfil removida com sucesso!',
          });

          user.value.image = null;
        })
        .onCancel(() => {
          return;
        });
    }

    const saveProfile = async () => {
      const userClone = clone(user.value);
      await handleApi<UserI>(() => UserService.update(userClone), {
        errorMessage: 'Ocorreu um erro ao atualizar o perfil.',
        successMessage: 'Perfil atualizado com sucesso!',
      });
    };

    const changePassword = async () => {
      const isValid = await passwordform.value.validate();
      if (!isValid) {
        $q.notify({
          type: 'negative',
          message: 'Por favor, corrija os erros no formulário.',
        });
        return;
      }

      const data: boolean = await handleApi(
        () => UserService.updatePassword(clone(passwordData.value)),
        {
          errorMessage: 'Ocorreu um erro ao alterar a senha.',
          successMessage: 'Senha alterada com sucesso!',
        },
      );

      if (data) {
        showChangePasswordDialog.value = false;
        passwordData.value = {
          currentPassword: '',
          newPassword: '',
          newPasswordConfirm: '',
        };
      }
    };

    const confirmDeleteAccount = async () => {
      if (deleteConfirmationText.value !== user.value.username) {
        return;
      }
      deleteConfirmationText.value = '';

      await handleApi(() => UserService.delete(), {
        errorMessage: 'Ocorreu um erro ao excluir a conta.',
        successMessage: 'Conta excluída com sucesso!',
      });
      showConfirmDeleteDialog.value = false;
      authStore.logout();
    };

    const logout = () => {
      $q.dialog({
        title: 'Sair',
        message: 'Tem certeza de que deseja sair?',
        cancel: {
          label: 'Cancelar',
          color: 'primary',
          flat: true,
        },
        ok: {
          label: 'Sair',
          color: 'negative',
          flat: true,
        },
        persistent: true,
      }).onOk(() => {
        authStore.logout();
      });
    };

    onMounted(async () => {
      await getUser();
    });

    return {
      user,
      avatarFile,
      fileInputRef,
      getUser,
      getUsernameInitials,
      handleAvatarUpload,
      removeAvatar,
      saveProfile,
      showConfirmDeleteDialog,
      deleteConfirmationText,
      isDarkMode,
      themeColor,
      showColorDialog,
      themeColorOptions,
      settingsStore,
      getHexColor,
      selectThemeColor,
      confirmDeleteAccount,
      showChangePasswordDialog,
      passwordData,
      passwordform,
      required,
      minLength,
      passwordMatch,
      changePassword,
      logout,
    };
  },
};
</script>

<style lang="scss" scoped>
.danger-zone-card {
  border: 1px solid $negative;
  border-left: 4px solid $negative;
}

.hidden {
  display: none;
}
</style>
