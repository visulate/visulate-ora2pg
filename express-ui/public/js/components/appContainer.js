app.component('app-container', {
  name: 'app-container',
  template:
    `
    <div id="app" class="app-container">
      <projects @set-project="setProject"></projects>
      <configuration :project="project" :config="config" @save-config="saveConfig"></configuration>
    </div>
    `,
  data() {
    return {
      project: null,
      config: {}
    }
  },
  methods: {
    async setProject(project) {
      this.project = project
      const res = await fetch(`/ora2pg/project/${project}`);
      const jsonResponse = await res.json();
      this.config = jsonResponse.config;
    },
    saveConfig(config) {
      console.log(config);
    }
  }

});