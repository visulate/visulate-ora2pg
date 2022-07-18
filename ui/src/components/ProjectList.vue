<template>
  <nav class="mdl-navigation" data-cy="project_list">
    <router-link
      v-for="(project) in projectList"
      :to="`/projects/${project}`"
      :key="project"
      class="mdl-navigation__link"
      :class="{ selected: project === currentProject }"
      >{{ project }}</router-link>
  </nav>
</template>
<script>
import httpClient from '../assets/httpClient';

export default {
  name: 'ProjectList',
  emits: ['set-project'],
    data() {
    return {
      projectList: [],
      currentProject: null,
    }
  },
  created() {
    this.getProjects();
  },
  beforeUpdate() {
    if (this.projectCount === 0) {
      this.$emit('create-project', {project: 'default'});
    }
  },
  computed: {
    projectCount() {
      return this.projectList.length;
    }
  },
  methods: {
    async getProjects() {
      const res = await httpClient('/ora2pg/projects');
      const jsonResponse = await res.json();
      this.projectList = jsonResponse.projects;
    },
    setCurrentProject(index) {
      if (!this.$parent.showRun) {
        this.currentProject = this.projectList[index];
      }
      this.$emit('set-project', this.currentProject);
    },
    setCurrentProjectName(projectName) {
      this.currentProject = projectName;
    }
  }
}
</script>