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
app.component('run-ora2pg', {
  name: 'RunOra2Pg',
  props: {
    project: {
      type: String
    }
  },
  template: /*html*/
    `<pre><code>{{outputText}}</code></pre>`,
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
    }
  }
});