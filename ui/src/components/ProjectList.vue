<template>
  <nav class="mdl-navigation">
    <a
      v-for="(project, index) in projectList"
      :key="project"
      @click="setCurrentProject(index)"
      class="mdl-navigation__link"
      :class="{ selected: project === currentProject }"
      >{{ project }}</a
    >
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
      const res = await httpClient('/ora2pg/projects', {
         headers: {
           "Authorization": `Bearer ${this.$parent.id_token}`
         }
      });
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