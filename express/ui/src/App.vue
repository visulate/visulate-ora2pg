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
        <button
          class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab"
          style="margin: 0 20px 0 0"
          @click="showHomePage"
          v-show="!showHome && !showRun"
        >
          <i class="material-icons">add</i>
        </button>
      </div>
    </div>

    <!-- Main body -->
    <main class="mdl-layout__content">
      <home-page
        v-show="showHome"
        @create-project="createProject"
        @cancel-create-project="hideHomePage"
      ></home-page>

      <run-ora2pg
        v-if="showRun"
        :project="project"
        @close-component="hideDetailsPage"
      ></run-ora2pg>

      <project-details
        ref="projectDetailsComponent"
        v-if="showDetails"
        :fileList="projectFiles"
        :project="project"
        @delete-project="deleteProject"
        @close-component="hideDetailsPage"
      ></project-details>

      <ora2pg-config
        ref="configComponent"
        :project="project"
        :config="config"
        @save-config="saveConfig"
        @run-config="runConfig"
        @show-files="showDetailsPage"
        v-show="!showHome && !showRun && !showDetails"
      ></ora2pg-config>
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
import Ora2pgConfig from './components/Ora2PgConfig';
import ProjectDetails from './components/ProjectDetails';
import ProjectList from './components/ProjectList';
import RunOra2pg from './components/RunOra2Pg';
import HomePage from './components/HomePage';

export default {
  name: "AppContainer",
  components: {
    Ora2pgConfig,
    ProjectDetails,
    ProjectList,
    RunOra2pg,
    HomePage
  },
  data() {
    return {
      project: null,
      showHome: true,
      showForm: false,
      showRun: false,
      showDetails: false,
      config: {},
      projectFiles: [],
    };
  },
  methods: {
    // Display notifications (e.g 'Saved') at bottom of screen
    showMessage(messageText) {
      // const notification = document.querySelector(".mdl-js-snackbar");
      // notification.MaterialSnackbar.showSnackbar({
      //   message: messageText,
      // });
      console.log(messageText);
    },
    // Show the home/create project page
    showHomePage() {
      this.project = null;
      this.showHome = true;
      this.showDetails = false;
    },
    // Hide the home page
    hideHomePage() {
      this.showHome = false;
    },
    // Show project files page
    async showDetailsPage() {
      const res = await fetch(`/ora2pg/project/${this.project}`);
      const jsonResponse = await res.json();
      this.projectFiles = jsonResponse.files;
      this.showDetails = true;
    },
    // Close run results and project files page
    hideDetailsPage() {
      this.showRun = false;
      this.showDetails = false;
    },
    // Create a new project
    async createProject(project) {
      const projectName = project.project;
      const rawResponse = await fetch("/ora2pg", {
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
        await this.setProject(projectName);
      } else if (response.status === 409) {
        this.showMessage("Supply a unique project name");
      }
    },
    // Set the current project
    async setProject(project) {
      if (this.showRun) {
        this.showMessage(
          "Project selection disabled while Ora2Pg run page is open"
        );
        return;
      }
      if (this.project === project) {
        return;
      }
      this.project = project;
      const res = await fetch(`/ora2pg/project/${project}`);
      const jsonResponse = await res.json();
      this.config = jsonResponse.config;
      this.projectFiles = jsonResponse.files;
      this.hideHomePage();
    },
    // Save the project configuration
    async saveConfig(configObj) {
      const project = configObj.project;
      const configJson = JSON.parse(configObj.config);
      const postBody = JSON.stringify(configJson);
      const rawResponse = await fetch(`/ora2pg/${project}`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: postBody,
      });
      const response = await rawResponse;
      const messageText =
        response.status == 201
          ? "Saved"
          : `Save failed with ${response.status} HTTP repsonse`;
      this.showMessage(messageText);
    },
    // Execute ora2pg using the current project configuration
    async runConfig(configObj) {
      await this.saveConfig(configObj);
      this.showRun = true;
    },
    // Delete a project
    async deleteProject(projObject) {
      const project = projObject.project;
      if (
        confirm(`This will delete project '${project}' and all of its files.`)
      ) {
        const rawResponse = await fetch(`/ora2pg/${project}`, {
          method: "delete",
        });
        const response = await rawResponse;
        const messageText =
          response.status == 204
            ? `${project} deleted`
            : `Delete failed with ${response.status} HTTP repsonse`;
        this.showMessage(messageText);
        this.project = null;

        this.$refs.projectsComponent.getProjects();
        this.$refs.projectsComponent.setCurrentProjectName();
        this.showHomePage();
      }
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
