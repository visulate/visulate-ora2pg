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
        <button
          class="mdl-button mdl-js-button mdl-button"
          @click.prevent="closeComponent()"
        >
          Close
        </button>
      </span>
    </div>
    <ul class="mdl-grid mdl-grid--no-spacing project-details-grid">
      <li v-for="file in fileList" :key="file" @click="downloadFile(file)"
        class="mdl-cell project-details-grid-file">
        {{file}}
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
import { httpGet } from "../assets/httpClient";
export default {
  name: 'ProjectDetails',
  data() {
    return {
      api_base: process.env.VUE_APP_API_BASE,
      endpoints_key: process.env.VUE_APP_ENDPOINTS_KEY
    }
  },
  emits: ['delete-project', 'close-component'],
  props: {
    project: {
      type: String
    },
    fileList: {
      type: Array
    },
    folderList: {
      type: Array
    }
  },
  methods: {
    deleteProject() {
      this.$emit('delete-project', {project: this.project});
    },
    closeComponent() {
      this.$emit('close-component');
    },
    async downloadFile(file) {
      const url = `/ora2pg/project/${this.project}/download/${file}`;
      const res = await httpGet(url);

      const blob = await res.blob();
      const localfile = window.URL.createObjectURL(blob)

      let link = document.createElement('a');
      link.href = localfile;
      link.download = file;
      link.click();
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