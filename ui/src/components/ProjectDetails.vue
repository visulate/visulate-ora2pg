<template>
  <div>
    <div class="action-menu">
      <b>Project Files</b>
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
    <ul class="mdl-list" style="padding-top: 0; padding-bottom: 0">
      <li v-for="file in fileList" class="mdl-list__item" :key="file"
        style="border-bottom: 1px solid #ddd">
      
        <span>{{file}}</span>
        <span class="material-icons" @click="downloadFile(file)"
         style="margin-left: auto; cursor: pointer" >file_download</span>
      </li>  
    </ul>
    <div class="mdl-list__item" style="border-top: 1px solid #ddd">
      <b>{{ fileCount }} files</b>
      <div style="margin-left: auto"
        @click="downloadFile(file)"><span class="material-icons">download_for_offline</span>
        </div>
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
    }
  }
}
</script>