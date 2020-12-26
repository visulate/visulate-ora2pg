app.component('app-container', {
  name: 'app-container',
  template:
    /*html*/
    `
    <div id="app" class="mdl-layout mdl-js-layout mdl-layout--fixed-drawer">
      <header class="mdl-layout__header">
        <div class="mdl-layout__header-row">
          <span class="mdl-layout__title">Visulate Ora2Pg<span v-if="project"> - {{project}}</span></span>

          <div class="mdl-layout-spacer"></div>

        </div>
      </header>

      <div class="mdl-layout__drawer">
      <span class="mdl-layout__title">Project</span>
        <projects @set-project="setProject" ref="projectsComponent"></projects>
        <div style="display: flex; justify-content: flex-end;">
          <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
                  style="margin: 0 20px 0 0;"
                  @click="showProjectForm"
                  v-show="!showProjectCard">
            <i class="material-icons">add</i>
          </button>
        </div>
      </div>


      <main class="mdl-layout__content">
        <div  v-show="project && !showProjectCard && !showRun && !showDetails" class="action-menu">
          <b>Parameters</b>
          <span>
            <button class="mdl-button mdl-js-button mdl-button"
                  @click.prevent="configAction('SAVE')">Save</button>
            <button  class="mdl-button mdl-js-button mdl-button"
                  @click.prevent="configAction('RUN')">Run</button>
            <button  class="mdl-button mdl-js-button mdl-button"
                  @click.prevent="configAction('REVIEW')">Review</button>
          </span>
        </div>

        <div v-show="showRun" class="action-menu">
          <b>Output</b>
          <span>
            <button class="mdl-button mdl-js-button mdl-button"
                  @click.prevent="configAction('CLOSE')">Close</button>
          </span>
        </div>

        <div v-show="showDetails" class="action-menu">
          <b>Project Files</b>
          <span>
            <button class="mdl-button mdl-js-button mdl-button"
                  @click.prevent="configAction('DELETE')">Delete</button>
            <button class="mdl-button mdl-js-button mdl-button"
                  @click.prevent="configAction('CLOSE')">Close</button>
          </span>
        </div>

        <createProject
          v-show="showProjectCard"
          @create-project="createProject"
          @cancel-create-project="hideProjectForm"></createProject>

        <runOra2pg v-if="showRun" :project="project"></runOra2pg>

        <projectDetails ref="projectDetailsComponent"
          v-show="showDetails"
          :fileList="projectFiles"
          :project="project"
          @delete-project="deleteProject"></projectDetails>

        <configuration ref="configComponent"
          :project="project" :config="config"
          @save-config="saveConfig"
          @run-config="runConfig"
          v-show="!showProjectCard && !showRun && !showDetails"></configuration>
      </main>

      <div aria-live="assertive" aria-atomic="true" aria-relevant="text" class="mdl-snackbar mdl-js-snackbar">
          <div class="mdl-snackbar__text"></div>
          <button type="button" class="mdl-snackbar__action"></button>
      </div>
    </div>
    `,
  data() {
    return {
      project: null,
      showProjectCard: true,
      showRun: false,
      showDetails: false,
      config: {},
      projectFiles: []
    }
  },
  methods: {
    async setProject(project) {
      this.project = project
      const res = await fetch(`/ora2pg/project/${project}`);
      const jsonResponse = await res.json();
      this.config = jsonResponse.config;
      this.projectFiles = jsonResponse.files;
      this.hideProjectForm();
    },
    showMessage(messageText){
      const notification = document.querySelector('.mdl-js-snackbar');
      notification.MaterialSnackbar.showSnackbar(
        {
          message: messageText
        }
      );
    },
    configAction(action){
      switch(action) {
        case 'RUN':
          this.$refs.configComponent.runConfig();
          break;
        case 'SAVE':
          this.$refs.configComponent.saveConfig();
          break;
        case 'DELETE':
          this.$refs.projectDetailsComponent.deleteProject();
          break;
        case 'CLOSE':
          this.showRun = false;
          this.showDetails = false;
          break;
        case 'REVIEW':
          this.showDetails = true;
          break;
        default:
          break;
      }
    },
    async saveConfig(configObj) {
      const project = configObj.project;
      const configJson = JSON.parse(configObj.config);
      const postBody = JSON.stringify(configJson)
      const rawResponse = await fetch(`/ora2pg/${project}`, {
            method: 'post',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: postBody
          });
      const response = await rawResponse;
      const messageText = (response.status == 201)? 'Saved': `Save failed with ${response.status} HTTP repsonse`;
      this.showMessage(messageText);
    },
    runConfig() {
      this.showRun = true;
    },
    async deleteProject(projObject){
      const project = projObject.project;
      if (confirm(`This will delete project '${project}' and all of its files.`)){
        const rawResponse = await fetch(`/ora2pg/${project}`, {
          method: 'delete'});
        const response = await rawResponse;
        const messageText = (response.status == 204)? `${project} deleted`: `Delete failed with ${response.status} HTTP repsonse`;
        this.showMessage(messageText);

        this.$refs.projectsComponent.getProjects();
        this.$refs.projectsComponent.setCurrentProjectName();
        this.showProjectForm();
      }
    },
    showProjectForm(){
      this.showProjectCard = true;
      this.showDetails = false;
    },
    hideProjectForm(){
      this.showProjectCard = false;
    },
    async createProject(project) {
      const projectName = project.project;
      this.showProjectCard = false;
      const rawResponse = await fetch('/ora2pg', {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(project)
      });
      const response = await rawResponse;
      if (response.status === 201) {
        this.$refs.projectsComponent.getProjects();
        this.$refs.projectsComponent.setCurrentProjectName(projectName);
        await this.setProject(projectName);
      }

    }
  }

});