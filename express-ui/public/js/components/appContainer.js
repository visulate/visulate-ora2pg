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
          <span  v-show="project && !showProjectCard && !showRun">
            <button class="mdl-button mdl-js-button mdl-button--raised" style="color: #fff;"
                    @click.prevent="configAction('SAVE')">Save</button>
            <button  class="mdl-button mdl-js-button mdl-button--raised" style="color: #fff;"
                    @click.prevent="configAction('RUN')">Run</button>
          </span>
          <span  v-show="showRun">
            <button class="mdl-button mdl-js-button mdl-button--raised" style="color: #fff;"
                    @click.prevent="configAction('CLOSE')">Close</button>
          </span>
        </div>
      </header>

      <div class="mdl-layout__drawer">
      <span class="mdl-layout__title">Project</span>
        <projects @set-project="setProject"></projects>
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
        <createProject
          v-show="showProjectCard"
          @create-project="createProject"
          @cancel-create-project="hideProjectForm"></createProject>

        <runOra2pg v-if="showRun" :project="project"></runOra2pg>


        <configuration ref="configComponent"
          :project="project" :config="config"
          @save-config="saveConfig"
          @run-config="runConfig"
          v-show="!showProjectCard && !showRun"></configuration>
      </main>
    </div>
    `,
  data() {
    return {
      project: null,
      showProjectCard: true,
      showRun: false,
      config: {}
    }
  },
  methods: {
    async setProject(project) {
      this.project = project
      const res = await fetch(`/ora2pg/project/${project}`);
      const jsonResponse = await res.json();
      this.config = jsonResponse.config;
      this.hideProjectForm();
    },
    configAction(action){
      switch(action) {
        case 'RUN':
          this.$refs.configComponent.runConfig();
          break;
        case 'SAVE':
          this.$refs.configComponent.saveConfig();
          break;
        case 'CLOSE':
          this.showRun = false;
          break;
        default:
          break;
      }
    },
    saveConfig(config) {
      console.log(config);
    },
    runConfig(config) {
      console.log('RUN' + config);
      this.showRun = true;
    },
    showProjectForm(){
      this.showProjectCard = true;
    },
    hideProjectForm(){
      this.showProjectCard = false;
    },
    createProject(project) {
      this.showProjectCard = false;
      console.log(project);
    }
  }

});