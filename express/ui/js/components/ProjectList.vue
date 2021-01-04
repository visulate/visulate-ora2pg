/*!
 * Copyright 2020 Visulate LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
app.component('project-list', {
  name: 'ProjectList',
  emits: ['set-project'],
  template:
    /*html*/
    `
    <nav class="mdl-navigation">
      <a v-for="(project, index) in projectList" :key="project"
        @click="setCurrentProject(index)"
        class="mdl-navigation__link"
        :class="{ selected: project === currentProject }">{{ project }}</a>
    </nav>
    `,
  data() {
    return {
      projectList: [],
      currentProject: null,
    }
  },
  created() {
    this.getProjects();
  },
  beforeUpdate() {
    if (this.projectCount === 0) {
      this.$emit('create-project', {project: 'default'});
    }
  },
  computed: {
    projectCount() {
      return this.projectList.length;
    }
  },
  methods: {
    async getProjects() {
      const res = await fetch('/ora2pg/projects');
      const jsonResponse = await res.json();
      this.projectList = jsonResponse.projects;
    },
    setCurrentProject(index) {
      if (!this.$parent.showRun) {
        this.currentProject = this.projectList[index];
      }
      this.$emit('set-project', this.currentProject);
    },
    setCurrentProjectName(projectName) {
      this.currentProject = projectName;
    }
  }
});