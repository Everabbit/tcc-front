<template>
  <q-card class="q-mb-md card-project">
    <q-dialog v-model="showAddColumnDialog" :position="$q.screen.xs ? 'bottom' : 'standard'">
      <AddColumnDialogComponent
        @close="toggleAddColumnDialog"
        :project-id="projectId"
        v-if="showAddColumnDialog"
      />
    </q-dialog>

    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-h6">Etapas da Tarefa</div>
        <q-btn
          v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
          color="primary"
          icon="add"
          :label="$q.screen.xs ? '' : 'Adicionar Etapa'"
          flat
          @click="toggleAddColumnDialog"
        />
      </div>
      <q-separator />

      <div class="q-mt-md">
        <div v-if="columns.length > 0">
          <q-list separator>
            <q-item v-for="column in columns" :key="column.id" class="q-mb-sm">
              <q-item-section>
                <q-item-label>{{ column.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
                  flat
                  dense
                  round
                  icon="edit"
                  @click=""
                />
                <q-btn
                  v-if="useRoles.hasPermission(RolesEnum.MANAGER)"
                  flat
                  dense
                  round
                  icon="delete"
                  @click=""
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div v-else class="text-grey">Nenhuma etapa de tarefa adicionada ainda.</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { RolesEnum } from 'src/enums/roles.enum';
import { useRolesStore } from 'src/stores/rolesStore';
import { TaskColumnI } from 'src/models/task_columns.model';
import AddColumnDialogComponent from 'src/components/dialogs/AddColumnDialog.component.vue';
import { ref } from 'vue';

export default {
  components: {
    AddColumnDialogComponent,
  },
  props: {
    projectId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const useRoles = useRolesStore();
    const showAddColumnDialog = ref<boolean>(false);
    const columns = ref<TaskColumnI[]>([]);

    function toggleAddColumnDialog(): void {
      showAddColumnDialog.value = !showAddColumnDialog.value;
    }

    return {
      useRoles, RolesEnum, columns, showAddColumnDialog, toggleAddColumnDialog
    }
  }
}
</script>