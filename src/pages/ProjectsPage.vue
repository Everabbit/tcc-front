<template>
  <q-page>
    <!-- arruma a página, e coloca o dialog de cadastro -->

    <q-dialog v-model="showDialog">
      <CreateProjectDialog></CreateProjectDialog>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import CreateProjectDialog from 'src/components/CreateProjectDialog.component.vue';
import emitter from 'src/utils/event_bus';
import { onBeforeUnmount, onMounted, ref } from 'vue';

export default {
  components: { CreateProjectDialog },

  setup() {
    const showDialog = ref<boolean>(false);

    function openDialog() {
      showDialog.value = true;
    }

    function closeDialog() {
      showDialog.value = false;
    }

    onMounted(() => {
      emitter.on('open-project-dialog', openDialog);
      emitter.on('close-project-dialog', closeDialog);
    });

    onBeforeUnmount(() => {
      emitter.off('open-project-dialog', openDialog);
      emitter.off('close-project-dialog', closeDialog);
    });

    return { showDialog };
  },
};
</script>

<style>
.dialog-card {
  width: 100%;
  min-width: 800px;
  color: var(--text-color);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
  padding: 15px 20px;
}

.dialog-content {
  padding: 20px;
}

.dialog-footer {
  border-top: 1px solid #333;
  padding: 15px 20px;
}
</style>
