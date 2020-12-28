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
/**
 * Execute ora2pg using the current project parameters and display the result.
 * Issues an API call on startup and listens for the server side events it
 * emits
 *
 */
app.component('run-ora2pg', {
  name: 'RunOra2Pg',
  emits: ['close-component'],
  props: {
    project: {
      type: String
    }
  },
  template: /*html*/
    `
    <div>
      <div class="action-menu">
        <b>Output</b>
        <span>
          <button class="mdl-button mdl-js-button mdl-button"
                @click.prevent="closeComponent()">Close</button>
        </span>
      </div>
      <pre><code>{{outputText}}</code></pre>
    </div>
    `,
  data() {
    return {
      outputText: ''
    }
  },
  created() {
    this.setupStream();
  },
  methods: {
    setupStream(){
      let es = new EventSource(`/ora2pg/${this.project}/exec/`);

      es.addEventListener('message', event => {
        this.outputText += `${event.data}\n`;
      }, false);

      es.addEventListener('error', event => {
        es.close();
      }, false);
    },
    closeComponent() {
      this.$emit('close-component');
    }
  }
});