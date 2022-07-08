<template>
  <div>
    <div class="action-menu">
      <b>Project Files and Folders</b>
      <span>
        <button
          class="mdl-button mdl-js-button mdl-button"
          @click.prevent="deleteProject()"
        >
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
      folderList: []
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
    async deleteProject() {
      if (
        confirm(`This will delete project '${this.project}' and all of its files.`)
      ) {
        const rawResponse = await httpClient(`/ora2pg/project/${this.project}`, {
          method: "delete",
        });
        const response = await rawResponse;
        const messageText =
          response.status == 204
            ? `${this.project} deleted`
            : `Delete failed with ${response.status} HTTP repsonse`;
        UIUtils.showMessage(messageText);
        this.$emit('delete-project')
        router.push('/');
      }
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