<template>
  <q-card flat class="project-card" @click="toVersions(project.id)">
    <div
      v-if="!project.banner"
      class="project-banner"
      :style="`background-color: ${getRandomColor()}`"
    ></div>
    <q-img v-else :src="project.banner" class="project-banner"></q-img>
    <q-card-section>
      <div class="project-header">
        <span style="font-size: 18px" class="text-weight-bold q-my-none">{{ project.name }}</span>
        <q-btn flat round dense icon="edit" color="grey-7" @click.stop="toProject(project.id)" />
      </div>
      <p class="project-description">{{ project.description }}</p>
      <div class="project-meta">
        <q-badge
          :color="getProjectStatusColor(project.status)"
          :label="getProjectStatusName(project.status)"
        />
        <div v-if="project.deadline" class="text-caption text-grey">
          <q-icon name="event" size="16px" class="q-mr-sm" />
          <span>Prazo: {{ formatDate(project.deadline) }}</span>
        </div>
      </div>
    </q-card-section>
    <q-card-actions class="project-footer">
      <div class="project-members">
        <q-avatar
          v-if="project.participation[0] && project.participation[0].user"
          size="30px"
          color="primary"
          text-color="white"
        >
          <q-img
            v-if="project.participation[0].user.image"
            :src="project.participation[0].user.image"
          />
          <span v-else>{{ getUsernameInitials(project.participation[0].user.username) }}</span>
        </q-avatar>
        <q-avatar
          v-if="
            project.participation.length > 1 &&
            project.participation[1] &&
            project.participation[1].user
          "
          size="30px"
          color="primary"
          text-color="white"
          style="margin-left: -8px"
        >
          <q-img
            v-if="project.participation[1].user.image"
            :src="project.participation[1].user.image"
          />
          <span v-else>{{ getUsernameInitials(project.participation[1].user.username) }}</span>
        </q-avatar>
        <q-avatar
          v-if="project.participation.length > 2"
          size="30px"
          color="grey-7"
          text-color="white"
          style="margin-left: -8px"
          >+{{ project.participation.length - 2 }}</q-avatar
        >
      </div>
      <div class="project-progress">
        <q-linear-progress
          :value="project.progress"
          color="primary"
          size="6px"
          style="width: 80px"
        />
        <span class="text-caption text-grey">{{ getFixedProgress(project.progress) }}%</span>
      </div>
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { ProjectStatus, ProjectStatusValues } from 'src/enums/project_status.enum';
import { ProjectI } from 'src/models/project.model';
import { clone, toBase64 } from 'src/utils/transform';
import { formatDate } from 'src/utils/utils';
import { PropType } from 'vue';
import { useRouter } from 'vue-router';
import { getUsernameInitials } from 'src/utils/utils';

export default {
  props: {
    project: {
      type: Object as PropType<ProjectI>,
      required: true,
    },
  },
  setup(props) {
    const $router = useRouter();
    const StatusValues = clone(ProjectStatusValues);

    function toProject(id: number) {
      $router.push('projetos/' + toBase64(id.toString()));
    }

    function toVersions(id: number) {
      $router.push('projetos/versoes/' + toBase64(id.toString()));
    }

    function getRandomColor(): string {
      const pastelColors = [
        // '#FFB3BA', // Pastel Red
        // '#FFDFBA', // Pastel Orange
        // '#FFFFBA', // Pastel Yellow
        // '#BAFFC9', // Pastel Green
        '#BAE1FF', // Pastel Blue
        // '#E0BBE4', // Pastel Purple
        // '#FFC0CB', // Pink
        // '#F0E68C', // Khaki
        // '#ADD8E6', // Light Blue
        // '#90EE90', // Light Green
      ];
      const randomIndex = Math.floor(Math.random() * pastelColors.length);
      return pastelColors[randomIndex];
    }
    function getProjectStatusName(status: ProjectStatus): string {
      return StatusValues.find((X) => X.id === status).name;
    }

    function getProjectStatusColor(status: ProjectStatus): string {
      return StatusValues.find((X) => X.id === status).color;
    }

    function getFixedProgress(progress: number): string {
      const prog = progress * 100;
      if (Number.isInteger(prog)) {
        return prog.toFixed(0);
      }
      return prog.toFixed(2);
    }

    return {
      toVersions,
      toProject,
      getRandomColor,
      getProjectStatusName,
      getProjectStatusColor,
      formatDate,
      getUsernameInitials,
      getFixedProgress,
    };
  },
};
</script>

<style scoped lang="scss">
.project-card {
  border-radius: 8px;
  border: 1px solid;
  border-color: $grey-4;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;

  .body--dark & {
    background-color: $grey-10;
    border: 0px solid;
  }
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.project-banner {
  height: 120px;
  background-size: cover;
  background-position: center;
}

.project-header {
  display: flex;
  justify-content: space-between;
}

.project-description {
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8em;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px;
}

.project-members {
  display: flex;
}

.project-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
