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
app.component('project-details', {
  name: 'ProjectDetails',
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