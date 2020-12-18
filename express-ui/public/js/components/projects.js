app.component('projects', {
  name: 'projects',
  template:
    `<div>
    <h3>Project</h3>
    <ul>
    <li v-for="(project, index) in projectList">
      <a @click="setCurrentProject(index)" :class="{ active: project === currentProject }">{{ project }}</a>
    </li>
    </ul>
    </div>`,
  data() {
    return {
      projectList: [],
      currentProject: null
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
    }
  }

});