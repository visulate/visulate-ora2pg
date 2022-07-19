<template>
  <div id="app" class="mdl-layout mdl-js-layout mdl-layout--fixed-drawer">
    <!-- Blue menu bar -->
    <header class="mdl-layout__header">
      <div class="mdl-layout__header-row">
        <span class="mdl-layout__title"
          >Visulate Ora2Pg<span v-if="project"> - {{ project }}</span></span
        >
      </div>
    </header>

    <!-- Project list -->
    <div class="mdl-layout__drawer">
      <span class="mdl-layout__title">Project</span>
      <project-list
        @set-project="setProject"
        @create-project="createProject"
        ref="projectsComponent"
      ></project-list>
      <div style="display: flex; justify-content: flex-end">
        <router-link
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
          style="margin: 0 20px 0 0"
          to="/" v-show="!isHomePage()"
          data-cy="add_project">
          <i class="material-icons">add</i>
        </router-link>
      </div>
    </div>

    <!-- Main body -->
    <main class="mdl-layout__content">
      <!-- :key="$route.fullPath" makes the UI update every time the route changes.
       Without this, the UI doesn't update when the only thing changing in the 
       path is a path param, e.g. switching projects -->
      <router-view :key="$route.fullPath" @create-project="createProject" 
      @run-started="setOra2PgRunning(true)" @run-complete="setOra2PgRunning(false)"
      @delete-project="onDeleteProject"/>
    </main>

    <!-- Notifications snackbar -->
    <div
      aria-live="assertive"
      aria-atomic="true"
      aria-relevant="text"
      class="mdl-snackbar mdl-js-snackbar"
    >
      <div class="mdl-snackbar__text"></div>
      <button type="button" class="mdl-snackbar__action"></button>
    </div>
  </div>
</template>

<script>
import ProjectList from './components/ProjectList';
import httpClient from './assets/httpClient';
import { UIUtils } from './utils/ui-utils';
import { router } from './router';

export default {
  name: "AppContainer",
  components: {
    ProjectList,
  },
  data() {
    return {
      project: null,
      showHome: true,
      showForm: false,
      ora2PgRunning: false,
      showDetails: false,
      config: {},
      projectFiles: [],
      projectFolders: [],
      user: ""
    };
  },
  mounted() {
    router.beforeEach((to, from, next) => {
      if (this.ora2PgRunning) {
        UIUtils.showMessage("Navigation is disabled while Ora2Pg is running")
      } else {
        this.setProject(to.params.project);
        next();
      }
    })
  },
  methods: {
    // Create a new project
    async createProject(project) {
      const projectName = project.project;
      const rawResponse = await httpClient(`/ora2pg`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });
      const response = await rawResponse;
      if (response.status === 201) {
        this.showHome = false;
        this.$refs.projectsComponent.getProjects();
        this.$refs.projectsComponent.setCurrentProjectName(projectName);
        router.push(`/projects/${projectName}`);
      } else if (response.status === 409) {
        UIUtils.showMessage("Supply a unique project name");
      }
    },
    onDeleteProject() {
        this.$refs.projectsComponent.getProjects();
    },
    // Set the current project
    setProject(project) {
      this.project = project;
      this.$refs.projectsComponent.setCurrentProjectName(project);
    },
    isHomePage() {
      return this.$route.fullPath === '/'
    },
    setOra2PgRunning(ora2PgRunning) {
      this.ora2PgRunning = ora2PgRunning;
    }
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
body, #app {
  height: 100%;
}

.dialog {
  position: fixed;
  z-index: 1;
  background: white;
  left: 0;
  right: 0;
  margin: auto;
  width: 400px !important;
}
.dialog > h4 {
  margin: 5px 0 0;
  padding-bottom: 10px;
}
.dialog h6 {
    border-bottom: 1px solid rgba(0,0,0,.12);
}
.dialog input {
    margin-bottom: 7px;
}
.dialog-container {
  position: fixed; 
  width: 100%; 
  height: 100%; 
  z-index: 1;
  background: rgba(0, 0, 0, .5)
}
.danger {
  color: red !important;
}
</style>
