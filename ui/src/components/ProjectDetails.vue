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
    <ul class="mdl-list">
      <li v-for="file in fileList" class="mdl-list__item" :key="file">
        <!--<a :href="`${api_base}/ora2pg/project/${project}/download/${file}?key=${endpoints_key}`" class="link">{{
          file
        }}</a>-->
        <button @click="downloadFile(file)">{{ file }}</button>
      </li>
    </ul>
    <p style="padding-left: 10px">{{ fileCount }} files</p>
  </div>
</template>
<script>
import { httpPost } from '../assets/httpClient';

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
      var url =
        '/download/' + file + '?key=' + this.endpoints_key;

      const res = await httpPost(url)
      console.log(res)
    }
  },
  computed: {
    fileCount() {
      return this.fileList.length;
    }
  }
}
</script>