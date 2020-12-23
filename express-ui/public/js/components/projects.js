app.component('projects', {
  name: 'projects',
  template:
    /*html*/
    `
    <nav class="mdl-navigation">
      <a v-for="(project, index) in projectList"
        @click="setCurrentProject(index)"
        class="mdl-navigation__link"
        :class="{ selected: project === currentProject }">{{ project }}</a>
    </nav>`,
  data() {
    return {
      projectList: [],
      currentProject: null,
    }
  },
  created() {
    this.getProjects();
  },
  methods: {
    async getProjects() {
      const res = await fetch('/ora2pg/projects');
      const jsonResponse = await res.json();
      this.projectList = jsonResponse.projects;
    },
    setCurrentProject(index) {
      this.currentProject = this.projectList[index];
      this.$emit('set-project', this.currentProject);
    },
    setCurrentProjectName(projectName) {
      this.currentProject = projectName;
    }
  }

});