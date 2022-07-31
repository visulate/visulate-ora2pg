<template>
  <run-ora2-pg
        v-if="showRun"
        :project="project"
        :config="configData"
        @close-component="hideDetailsPage"
      ></run-ora2-pg>
  <div v-else>
    <auth-dialog ref="authDialog" :config-data="configData" :project="project" v-bind="$attrs" @run-config="doRun"></auth-dialog>
    <div v-show="project && Object.keys(this.configData).length === 0">
      <p>{{ project }} project data is unavailable</p>
    </div>
    <div
      v-show="project && Object.keys(this.configData).length > 0"
      class="action-menu"
    >
      <b>Parameters</b>
      <span v-show="project">
        <button class="mdl-button mdl-js-button mdl-button"
          @click.prevent="saveConfig()">Save</button>
        <a class="mdl-button mdl-js-button mdl-button"
          :href="`${api_base}/ora2pg/project/${project}/export`">Export</a>
        <button class="mdl-button mdl-js-button mdl-button"
          @click.prevent="runConfig()" data-cy="run_ora2pg">Run</button>
        <router-link class="mdl-button mdl-js-button mdl-button"
          :to="`/projects/${project}/details`" data-cy="review">Review</router-link>
      </span>
    </div>
    <form v-show="Object.keys(this.configData).length > 0">
      <span style="float: right">
        <a v-show="showAdvanced" @click="setAdvanced(false)"
          >Hide advanced settings</a>
        <a v-show="!showAdvanced" @click="setAdvanced(true)"
          >Show advanced settings</a>
      </span>
      <div v-for="(properties, section) in configData" :key="section" >
        <!-- Expansion panel header -->
        <h3 class="accordion active"
          :ref="section + '-h3'"
          @click="toggleAccordion(section)"
          v-show="properties.class == 'basic' || showAdvanced" >
          {{ section }} - {{ properties.title }} </h3>
        <!-- Expansion panel contents -->
        <ul class="panel" :ref="section" style="display: block">
          <li v-for="(item, key) in properties.values" :key="key"
            v-show="(item.class == 'basic' || showAdvanced) &&
            item.type !== 'username' && item.type !== 'password'" >
            <!-- Ora2Pg parameter row -->
            <div class="mdl-textfield" style="width: 500px">
              <label :for="key" :class="{ disabled: !item.include }">{{ key }}
                <span class="tooltip">
                  <i :id="key + '-tt'"
                    class="icon material-icons"
                    style="font-size: 14px" >help</i >
                  <span class="tip" :data-mdl-for="key + '-tt'">{{
                    item.description
                  }}</span>
                </span>
              </label>
              <!-- Form field display properties are controlled using a v-if condition
            which reads values from the ora2pg-conf.json file.

            Boolean (0/1) values and parameters with a fixed list of valid values are
            displayed as a drop down list. Values where the parameter length exceeds
            60 characters are displayed as a text area. Password parameters use an
            input of type password. Everything else is rendered as input type text.
            -->
              <div v-if="item.flag" class="select">
                <select :id="key"
                  v-model="item.value"
                  :disabled="!item.include"
                  class="select-text" >
                  <option value="0">Disabled</option>
                  <option value="1">Enabled</option>
                </select>
                <span class="select-highlight"></span>
                <span class="select-bar"></span>
              </div>
              <div v-else-if="item.enum" class="select">
                <select :id="key"
                  v-model="item.value"
                  :disabled="!item.include"
                  class="select-text" >
                  <option v-for="validValue in item.enum"
                    :value="validValue"
                    :key="validValue" >
                    {{ validValue }}
                  </option>
                </select>
                <span class="select-highlight"></span>
                <span class="select-bar"></span>
              </div>
              <textarea :id="key"
                v-else-if="item.value.length > 60"
                v-model="item.value"
                :disabled="!item.include"
                class="mdl-textfield__input"></textarea>
              <input :id="key"
                v-else-if="item.type === 'dsn'"
                type="text"
                v-model="item.value"
                :disabled="!item.include"
                class="mdl-textfield__input"
                @blur="$refs.authDialog.handleAuth(false)" 
                :data-cy="`dsn_${key}`"/>
              <input :id="key"
                v-else-if="item.type === 'timestamp'"
                type="text"
                :value="formatDate(item.value)"
                :disabled="!item.include"
                class="mdl-textfield__input" />
              <input :id="key"
                v-else
                type="text"
                v-model="item.value"
                :disabled="!item.include"
                class="mdl-textfield__input" />
              <!-- Checkbox to control whether the parameter should be commented out in
            the ora2pg.conf file at runtime -->
              <span style="float: right" v-if="item.type !== 'internal' && item.type !== 'timestamp'">
                <input v-if="item.type !== 'dsn'"
                  class="checkbox"
                  type="checkbox"
                  v-model="item.include"
                />
                <input v-else @change="dsnCheckboxClick(item)"
                  class="checkbox"
                  type="checkbox"
                  v-model="item.include"
                  :data-cy="`dsn_enabled_${key}`"/>
              </span>
            </div>
          </li>
        </ul>
      </div>
    </form>
  </div>
</template>
<script>
import AuthDialog from './AuthDialog.vue';
import RunOra2Pg from './RunOra2Pg.vue';
import httpClient from '../assets/httpClient';
import { router } from '../router';
export default {
  components: { AuthDialog, RunOra2Pg },
  props: {
    project: {
      type: String,
    }
  },
  data() {
    return {
      configData: {},
      showAdvanced: false,
      api_base: process.env.VUE_APP_API_BASE || '',
      showRun: false
    };
  },
  // populate the OUTPUT filename with a default value when the EXPORT type changes
  computed: {
    runType() {
      if (this.configData.EXPORT) {
        return this.configData.EXPORT.values.TYPE.value.toLowerCase();
      }
      return "output"
    },
  },
  watch: {
    runType: function (newValue) {
      // Simulate data entry in OUTPUT form field
      if (document.getElementById("OUTPUT")) {
        document.getElementById("OUTPUT").value = `${newValue}.sql`;
        document.getElementById("OUTPUT").dispatchEvent(new CustomEvent("input"));
      }
    },
  },
  async mounted() {
      const res = await httpClient(`/ora2pg/project/${this.project}`);
      if (res.status === 404) {
        alert(`Could not find a project named ${this.project}`);
        router.push('/');
      }
      const jsonResponse = await res.json();

      this.configData = jsonResponse.config;
  },
  methods: {
    // Display notifications (e.g 'Saved') at bottom of screen
    showMessage(messageText) {
      const notification = document.querySelector(".mdl-js-snackbar");
      notification.MaterialSnackbar.showSnackbar({
        message: messageText,
      });
    },
    async saveConfig() {
      const postBody = JSON.stringify(this.configData);
      const response = await httpClient(`/ora2pg/project/${this.project}`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: postBody,
      });
      const messageText =
        response.status == 201
          ? "Saved"
          : `Save failed with ${response.status} HTTP repsonse`;
      if (response.status === 409) {
        alert('Save failed because this project was updated by another user. Please refresh the page and try again.');
      } else {
        this.showMessage(messageText);
        if (response.status === 201) {
          this.configData.COMMON.values.LAST_MODIFIED = {
            description: 'Timestamp of the last time the configuration for this project was updated.',
            include: false,
            type: 'timestamp',
            value: await response.text()
          }
        }
      }
      return response.status == 201;
    },
    runConfig() {
      this.$refs.authDialog.handleAuth(() => {
        this.doRun();
      });
    },
    async doRun() {
        const success = await this.saveConfig();
        if (success) {
          this.showRun = true;
        }
    },
    // Close run results and project files page
    hideDetailsPage() {
      this.showRun = false;
      this.showDetails = false;
    },
    showFiles() {
      this.$emit("show-files", { project: this.project });
    },
    setAdvanced(val) {
      this.showAdvanced = val;
    },
    toggleAccordion(section) {
      let h3 = this.$refs[section+'-h3'][0];
      h3.classList.toggle("active");
      let panel = this.$refs[section][0];
      if (panel.style.display == "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    },
    dsnCheckboxClick(item) {
      if (item.include) {
        this.$refs.authDialog.handleAuth(false);
      }
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toString();
    }
  },
};
</script>
