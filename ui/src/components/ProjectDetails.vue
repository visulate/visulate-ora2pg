<template>
<div>
  <div v-if="showDeleteDialog" class="dialog-container">
    <div class="mdl-dialog dialog">
      <h4 class="mdl-dialog__content">Delete project?</h4>
      <div class="mdl-dialog__content">
        Would you like to delete {{project}} and all its files or just the configuration file?
      </div>
      <div class="mdl-dialog__actions">
          <button type="button" class="mdl-button danger" @click="deleteProject" data-cy="delete_project">Delete everything</button>
          <button type="button" class="mdl-button" @click="deleteConfig">Delete config</button>
          <button type="button" class="mdl-button" @click="cancelDelete">Cancel</button>
        </div>
    </div>
  </div>
    <div class="action-menu">
      <b>Project Files and Folders</b>
      <span>
        <button
          class="mdl-button mdl-js-button mdl-button"
          @click.prevent="clickDelete()"
          data-cy="delete">
          Delete
        </button>
        <router-link
          class="mdl-button mdl-js-button mdl-button"
          :to="`/projects/${project}`"
        >
          Close
        </router-link>
      </span>
    </div>
    <ul class="mdl-grid mdl-grid--no-spacing project-details-grid">
      <li v-for="file in fileList" :key="file"
        class="mdl-cell project-details-grid-file">
          <a :href="`${api_base}/ora2pg/project/${project}/download/${file}?key=${endpoints_key}`" class="link">
        {{file}}</a>
      </li>
      <li v-for="folder in folderList" class="mdl-cell" :key="folder">
        {{ folder }}/
      </li>

    </ul>
    <div class="project-details-footer">
      {{ fileCount }} files, {{ folderCount }} folders (folders are included in <a>{{ project }}.tar.gz</a>)
    </div>
  </div>
</template>
<script>
import httpClient from '../assets/httpClient';
import { router } from '../router';
import { UIUtils } from '../utils/ui-utils';

export default {
  name: 'ProjectDetails',
  data() {
    return {
      api_base: process.env.VUE_APP_API_BASE || '',
      endpoints_key: process.env.VUE_APP_ENDPOINTS_KEY || '',
      fileList: [],
      folderList: [],
      showDeleteDialog: false
    }
  },
  emits: ['delete-project', 'close-component'],
  props: {
    project: {
      type: String
    }
  },
  async mounted() {
    const res = await httpClient(`/ora2pg/project/${this.project}`);
    const jsonResponse = await res.json();
    this.fileList = jsonResponse.files;
    this.folderList = jsonResponse.directories;
  },
  methods: {
    clickDelete() {
      this.showDeleteDialog = true;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
    },
    async deleteProject() {
      const response = await httpClient(`/ora2pg/project/${this.project}`, {
        method: "delete",
      });
      const messageText =
        response.status == 204
          ? `${this.project} deleted`
          : `Delete failed with ${response.status} HTTP repsonse`;
      UIUtils.showMessage(messageText);
      this.$emit('delete-project')
      router.push('/');
    },
    async deleteConfig() {
      const response = await httpClient(`/ora2pg/project/${this.project}/config`,{
        method: "delete"
      });
      let messageText;
      if (response.status == 204) {
        messageText = `${this.project} configuration file deleted`;
      } else if (response.status == 409) {
        messageText = `Configuration file for ${this.project} already does not exist`
      } else {
        messageText = `Delete failed with ${response.status} HTTP repsonse`;
      }
      UIUtils.showMessage(messageText);
      this.showDeleteDialog = false;
    },
    closeComponent() {
      router.push(`/projects/${this.project}`)
    }
  },
  computed: {
    fileCount() {
      return this.fileList.length;
    },
    folderCount() {
      return this.folderList.length;
    }
  }
}
</script>
<style scoped>
.dialog {
  width: 450px !important;
}
</style>