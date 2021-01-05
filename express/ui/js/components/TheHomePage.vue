/*!
 * Copyright 2020, 2021 Visulate LLC. All Rights Reserved.
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
app.component('home-page', {
  name: 'TheHomePage',
  template: /*html*/
  `
  <div style="display: flex;">
    <div class="mdl-card mdl-shadow--2dp" >
      <div class="mdl-card__title">
        <h2 class="mdl-card__title-text">Visulate Ora2Pg</h2>
      </div>
      <div class="mdl-card__supporting-text">
        Ora2Pg is a command line tool that migrates Oracle (or MySQL) databases to PostgreSQL by generating compatible SQL files.
        Visulate Ora2pg is a UI for it. <br/><br/>
        To get started with Visulate Ora2Pg, use the left menu to select an existing project or the form on the right to create a new project.
      </div>
    </div>
    <div class="mdl-card mdl-shadow--2dp" >
      <form>
        <div class="mdl-card__title">
          <h2 class="mdl-card__title-text">Create a new project</h2>
        </div>
        <div class="mdl-card__supporting-text">
          <input @keypress="validChar($event)"
                 @keyup.enter="onSubmit"
                 v-model="project"
                 class="mdl-textfield__input"
                 placeholder="project_name" />
          <p v-show="errorMessage" class="error">{{errorMessage}}</p>
          Enter a project name then press CREATE
        </div>

        <div class="mdl-card__actions mdl-card--border">
          <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" @click.prevent="onSubmit">
            Create
          </a>
          <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" @click.prevent="onCancel">
          Cancel
          </a>
        </div>
      </form>
    </div>
  </div>
  `,
  data() {
    return {
      project: null,
      errorMessage: null
    }
  },
  methods: {
    validChar(e) {
      let char = String.fromCharCode(e.keyCode);
      if (/^[a-zA-Z0-9_]+$/.test(char)) return true;
      else e.preventDefault();
    },
    onSubmit() {
      this.errorMessage = null;
      if (!this.project) {
        this.errorMessage = "Enter a project name";
        return;
      }
      this.$emit('create-project', {project: this.project});
    },
    onCancel() {
      this.$emit('cancel-create-project');
    },
  }
});