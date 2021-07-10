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
    <ul class="mdl-list">
      <li v-for="file in fileList" class="mdl-list__item" :key="file">
        <a :href="`${api_base}/ora2pg/project/${project}/download/${file}?key=${endpoints_key}`" class="link">{{
          file
        }}</a>
      </li>
      <li v-for="folder in folderList" class="mdl-list__item" :key="folder">
        {{ folder }}/
      </li>
    </ul>
    <p style="padding-left: 10px">{{ fileCount }} files<span v-if="folderCount !==0">,
      {{ folderCount }} folders (folders are included in
      <a :href="`${api_base}/ora2pg/project/${project}/download/${project}.tar.gz?key=${endpoints_key}`" class="link">
      {{ project }}.tar.gz</a>)</span></p>
  </div>
</template>
<script>
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