<template>
    <div v-if="showDialog" class="auth-dialog-container" @test-event="test">
      <div class="mdl-dialog auth-dialog" >
        <h4 class="mdl-dialog__content">Enter database credentials</h4>
        <div class="mdl-dialog__content">
          <label for="ORACLE_DSN">ORACLE_DSN
              <span class="tooltip">
                  <i id="ORACLE_DSN-tt"
                    class="icon material-icons"
                    style="font-size: 14px" >help</i >
                  <span class="tip" data-mdl-for="ORACLE_DSN-tt">{{
                    configData.INPUT.values.ORACLE_DSN.description
                  }}</span>
                </span>
          </label>
          <input disabled :value="configData.INPUT.values.ORACLE_DSN.value"
              name="ORACLE_DSN" type="text" class="mdl-textfield__input" />

          <label for="ORACLE_USER">ORACLE_USER
              <span class="tooltip">
                  <i id="ORACLE_USER-tt"
                    class="icon material-icons"
                    style="font-size: 14px" >help</i >
                  <span class="tip" data-mdl-for="ORACLE_USER-tt">{{
                    configData.INPUT.values.ORACLE_USER.description
                  }}</span>
                </span>
          </label>
          <input v-model="oracleUser" name="ORACLE_USER"
              type="text" class="mdl-textfield__input" />

          <label for="ORACLE_PWD">ORACLE_PWD
                <span class="tooltip">
                  <i id="ORACLE_PWD-tt"
                    class="icon material-icons"
                    style="font-size: 14px" >help</i >
                  <span class="tip" data-mdl-for="ORACLE_PWD-tt">{{
                    configData.INPUT.values.ORACLE_PWD.description
                  }}</span>
                </span>
          </label>
          <input v-model="oraclePwd" name="ORACLE_PWD"
              type="password" class="mdl-textfield__input" />
          
          <div class="pg-credentials-container" v-if="configData.OUTPUT.values.PG_DSN.include">
            <label for="PG_DSN">PG_DSN
                <span class="tooltip">
                    <i id="PG_DSN-tt"
                        class="icon material-icons"
                        style="font-size: 14px" >help</i >
                    <span class="tip" data-mdl-for="PG_DSN-tt">{{
                        configData.OUTPUT.values.PG_DSN.description
                    }}</span>
                    </span>
            </label>
            <input disabled :value="configData.OUTPUT.values.PG_DSN.value"
                name="PG_DSN" type="text" class="mdl-textfield__input" />

            <label for="PG_USER">PG_USER
                <span class="tooltip">
                    <i id="PG_USER-tt"
                        class="icon material-icons"
                        style="font-size: 14px" >help</i >
                    <span class="tip" data-mdl-for="PG_USER-tt">{{
                        configData.OUTPUT.values.PG_USER.description
                    }}</span>
                    </span>
            </label>
            <input v-model="pgUser" name="PG_USER"
                type="text" class="mdl-textfield__input" />

            <label for="PG_PWD">PG_PWD
                <span class="tooltip">
                    <i id="PG_PWD-tt"
                        class="icon material-icons"
                        style="font-size: 14px" >help</i >
                    <span class="tip" data-mdl-for="PG_PWD-tt">{{
                        configData.OUTPUT.values.PG_PWD.description
                    }}</span>
                    </span>
            </label>
            <input v-model="pgPwd" name="PG_PWD"
                type="password" class="mdl-textfield__input" />
          </div>
        </div>
        <div class="mdl-dialog__actions">
          <button type="button" class="mdl-button close" @click="credentialsDialogSubmit">Run</button>
          <button type="button" class="mdl-button" @click="credentialsDialogCancel">Cancel</button>
        </div>
      </div>
    </div>
</template>
<script>
export default {
    props: {
        project: {
            type: String
        },
        configData: {
            type: Object
        }
    },
    data() {
        return {
            showDialog: false,
            oracleUser: '',
            oraclePwd: '',
            pgUser: '',
            pgPwd: ''
        }
    },
    methods: {
        runConfig() {
            this.$emit("run-config", {
                project: this.project,
                config: JSON.stringify(this.configData),
            });
        },
        credentialsDialogSubmit() {
            const oracleDsn = this.configData.INPUT.values.ORACLE_DSN;
            const postgresDsn = this.configData.OUTPUT.values.PG_DSN;
            sessionStorage.setItem(oracleDsn.value, JSON.stringify({user: this.oracleUser, pass: this.oraclePwd}));
            sessionStorage.setItem(postgresDsn.value, JSON.stringify({user: this.pgUser, pass: this.pgPwd}));
            this.runConfig();
        },
        credentialsDialogCancel() {
            this.showDialog = false;
        },
        handleAuthForRun() {
            const oracleDsn = this.configData.INPUT.values.ORACLE_DSN;
            const postgresDsn = this.configData.OUTPUT.values.PG_DSN;
            if (oracleDsn.include && !sessionStorage.getItem(oracleDsn.value) ||
                postgresDsn.include && !sessionStorage.getItem(postgresDsn.value)) {
                this.showDialog = true;
            } else {
                this.runConfig();
            }
        }
    }
}
</script>
<style scoped>
.auth-dialog {
  position: fixed;
  z-index: 1;
  background: white;
  left: 0;
  right: 0;
  margin: auto;
  width: 400px;
}
.auth-dialog > h4 {
  margin: 5px 0 0;
  padding-bottom: 10px;
}
.auth-dialog h6 {
    border-bottom: 1px solid rgba(0,0,0,.12);
}
.auth-dialog input {
    margin-bottom: 7px;
}
.auth-dialog-container {
  position: fixed; 
  width: 100%; 
  height: 100%; 
  z-index: 1;
  background: rgba(0, 0, 0, .5)
}
.pg-credentials-container {
    margin-top: 20px;
}
</style>
