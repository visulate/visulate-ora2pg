<template>
  <div>
    <div v-if="showCredentialsDialog" class="auth-dialog-container">
      <div class="mdl-dialog auth-dialog" >
        <h4 class="mdl-dialog__content">Enter database credentials</h4>
        <div class="mdl-dialog__content">
          <label>ORACLE_USER</label>
         <input v-model="oracleUser"
            type="text"
            class="mdl-textfield__input" />
          <label>ORACLE_PWD</label>
         <input v-model="oraclePwd"
            type="text"
            class="mdl-textfield__input" />
          <label>PG_USER</label>
         <input v-model="pgUser"
            type="text"
            class="mdl-textfield__input" />
          <label>PG_PWD</label>
         <input v-model="pgPwd"
            type="text"
            class="mdl-textfield__input" />
        </div>
        <div class="mdl-dialog__actions">
          <button type="button" class="mdl-button close" @click="credsDialogSubmit">Run</button>
          <button type="button" class="mdl-button" @click="credsDialogCancel">Cancel</button>
        </div>
      </div>
      </div>
    <div v-show="project && Object.keys(this.configData).length === 0">
      <p>{{ project }} project is encrypted</p>
    </div>
    <div
      v-show="project && Object.keys(this.configData).length > 0"
      class="action-menu"
    >
      <b>Parameters</b>
      <span v-show="project">
        <button class="mdl-button mdl-js-button mdl-button"
          @click.prevent="saveConfig()">Save</button>
        <button class="mdl-button mdl-js-button mdl-button"
          @click.prevent="clickRunConfig()">Run</button>
        <button class="mdl-button mdl-js-button mdl-button"
          @click.prevent="showFiles()">Review</button>
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
            v-show="item.class == 'basic' || showAdvanced" >
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
              <input :id="key" disabled
                v-else-if="authInputKeys.indexOf(key) !== -1"
                 v-model="item.value"
                 v-bind:type="item.type === 'password' ? 'password' : 'text'"
                class="mdl-textfield__input"/>
              <input :id="key"
                v-else
                type="text"
                v-model="item.value"
                :disabled="!item.include"
                class="mdl-textfield__input" />
              <!-- Checkbox to control whether the parameter should be commented out in
            the ora2pg.conf file at runtime -->
              <span style="float: right" v-if="authInputKeys.indexOf(key) === -1">
                <input
                  class="checkbox"
                  type="checkbox"
                  v-model="item.include"
                />
              </span>
            </div>
          </li>
        </ul>
      </div>
    </form>
  </div>
</template>
<script>
export default {
  props: {
    project: {
      type: String,
    },
    config: {
      type: Object,
    },
  },
  data() {
    return {
      configData: {},
      showAdvanced: false,
      authInputKeys: ['ORACLE_USER', 'ORACLE_PWD', 'PG_USER', 'PG_PWD'],
      showCredentialsDialog: false,
      oracleUser: '',
      oraclePwd: '',
      pgUser: '',
      pgPwd: ''
    };
  },
  beforeUpdate() {
    this.configData = { ...this.config };
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
  methods: {
    saveConfig() {
      this.$emit("save-config", {
        project: this.project,
        config: JSON.stringify(this.configData),
      });
    },
    clickRunConfig() {
      const oracleDsn = this.configData.INPUT.values.ORACLE_DSN;
      const postgresDsn = this.configData.OUTPUT.values.PG_DSN;
      if (oracleDsn.include && !sessionStorage.getItem(oracleDsn.value) ||
        postgresDsn.include && !sessionStorage.getItem(postgresDsn.value)) {
        this.showCredentialsDialog = true;
      } else {
        this.runConfig();
      }
    },
    runConfig() {
      this.$emit("run-config", {
        project: this.project,
        config: JSON.stringify(this.configData),
      });
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
    credsDialogSubmit() {
      const oracleDsn = this.configData.INPUT.values.ORACLE_DSN;
      const postgresDsn = this.configData.OUTPUT.values.PG_DSN;
      sessionStorage.setItem(oracleDsn.value, JSON.stringify({user: this.oracleUser, pass: this.oraclePwd}));
      sessionStorage.setItem(postgresDsn.value, JSON.stringify({user: this.pgUser, pass: this.pgPwd}));
      this.runConfig();
    },
    credsDialogCancel() {
      this.showCredentialsDialog = false;
    }
  },
};
</script>
<style scoped>
.auth-dialog {
  position: fixed;
  z-index: 1;
  background: white;
  left: 0;
  right: 0;
  margin: auto;
}
.auth-dialog>h4 {
  margin: 5px 0 0;
  padding-bottom: 10px;
}
.auth-dialog-container {
  position: fixed; 
  width: 100%; 
  height: 100%; 
  z-index: 1;
  background: rgba(0, 0, 0, .5)
}
</style>