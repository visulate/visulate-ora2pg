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
        <a :href="'/ora2pg/' + project + '/download/' + file" class="link">{{
          file
        }}</a>
      </li>
    </ul>
    <p style="padding-left: 10px">{{ fileCount }} files</p>
  </div>
</template>
<script>
export default {
  name: 'ProjectDetails',
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
    }
  },
  computed: {
    fileCount() {
      return this.fileList.length;
    }
  }
}
</script>