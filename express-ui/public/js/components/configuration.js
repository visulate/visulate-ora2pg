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
app.component('configuration', {
    name: 'configuration',
    template:
    /*html*/
    `
    <div>
    <form v-show="Object.keys(this.configData).length > 0">
    <span style="float: right">
    <a v-show="showAdvanced" @click="setAdvanced(false)">Hide advanced settings</a>
    <a v-show="!showAdvanced" @click="setAdvanced(true)">Show advanced settings</a>
    </span>

    <div v-for="(properties, section) in configData">
    <h3 class="accordion active" :ref="section+'-h3'"
        @click="toggleAccordion(section)"
        v-show="properties.class == 'basic' || showAdvanced">
        {{ section }} - {{ properties.title }}
    </h3>
    <ul class="panel" :ref="section" style="display: block">
      <li v-for="(item, key) in properties.values" v-show="item.class == 'basic' || showAdvanced">
        <div class="mdl-textfield" style="width: 500px;">
          <label :for="key" :class="{ disabled: !item.include}">{{ key }}
            <span class="tooltip">
              <i :id="key+'-tt'" class="icon material-icons" style="font-size: 14px;">help</i>
              <span class="tip" :data-mdl-for="key+'-tt'">{{ item.description }}</span>
            </span>
          </label>

          <div v-if="item.flag" class="select">
            <select :id="key"  v-model="item.value" :disabled="!item.include" class="select-text">
              <option value="0" >Disabled</option>
              <option value="1" >Enabled</option>
            </select>
            <span class="select-highlight"></span>
            <span class="select-bar"></span>
          </div>

          <div v-else-if="item.enum" class="select">
            <select :id="key"  v-model="item.value" :disabled="!item.include" class="select-text">
              <option  v-for="validValue in item.enum" :value="validValue" >{{validValue}}</option>
            </select>
            <span class="select-highlight"></span>
            <span class="select-bar"></span>
          </div>

          <textarea :id="key" v-else-if="item.value.length > 60" v-model="item.value" :disabled="!item.include"  class="mdl-textfield__input"></textarea>

          <input :id="key" v-else-if="item.type==='password'" type="password" v-model="item.value" :disabled="!item.include" class="mdl-textfield__input"/>

          <input :id="key" v-else type="text" v-model="item.value" :disabled="!item.include" class="mdl-textfield__input"/>

          <span style="float: right">
            <input class="checkbox" type="checkbox" v-model="item.include" />
          </span>
        </div>
      </li>
    </ul>
    </div>

    </form>
    </div>
    `,
    props: {
      project: {
        type: String
      },
      config: {
        type: Object
      }
    },
    data() {
      return {
        configData: {},
        showAdvanced: false
      }
    },
    beforeUpdate() {
      this.configData = {...this.config};
    },
    methods: {
      saveConfig() {
        this.$emit('save-config', {project: this.project, config: JSON.stringify(this.configData)});
      },
      runConfig() {
        this.$emit('run-config', {project: this.project, config: JSON.stringify(this.configData)});
      },
      setAdvanced(val) {
        this.showAdvanced = val
      },
      toggleAccordion(section){
        let h3 = this.$refs[section+'-h3']
        h3.classList.toggle('active');
        let panel = this.$refs[section];
        if (panel.style.display == "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      }
    }

})