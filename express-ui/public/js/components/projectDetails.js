app.component('projectDetails', {
  name: 'projectDetails',
  props: {
    project: {
      type: String
    },
    fileList: {
      type: Array
    }
  },
  template:
    /*html*/
    `
      <ul class='mdl-list'>
        <li v-for="file in fileList" class="mdl-list__item">
        <a :href="'/ora2pg/'+project+'/download/'+file" class="link">{{ file }}</a>
        </li>
      </ul>
      `,
  methods: {
    deleteProject() {
      this.$emit('delete-project', {project: this.project});
    }
  }

});