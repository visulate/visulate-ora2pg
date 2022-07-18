<template>
    <div v-if="showDialog" class="dialog-container" @test-event="test" data-cy="auth_dialog">
      <div class="mdl-dialog dialog" >
        <h4 class="mdl-dialog__content">Enter database credentials</h4>
        <div class="mdl-dialog__content">
          <div v-for="error in errors" :key="error" class="error" data-cy="auth_validation_error">{{error}}</div>
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
              type="text" class="mdl-textfield__input" data-cy="auth_oracle_user" />

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
              type="password" class="mdl-textfield__input" data-cy="auth_oracle_pwd" />
          <p class="error" v-if="oracleCredsError" data-cy="oracle_credentials_error">{{oracleCredsError}}</p>
          
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
            <p class="error" v-if="postgresCredsError">{{postgresCredsError}}</p>
          </div>
        </div>
        <div class="mdl-dialog__actions">
          <div v-if="showSubmit">
            <button v-if="runAfter" type="button" class="mdl-button" @click="saveCredentialsAndRun">Run</button>
            <button v-else type="button" class="mdl-button" @click="saveCredentials" data-cy="submit_auth">Save</button>
          </div>
          <div v-else>
              <button class="mdl-button" disabled>Testing credentials...</button>
          </div>
          <button type="button" class="mdl-button" @click="cancel" data-cy="cancel_auth">Cancel</button>
        </div>
      </div>
    </div>
</template>
<script>
import httpClient from '../assets/httpClient';
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
            pgPwd: '',
            runAfter: false,
            errors: [],
            oracleCredsError: '',
            postgresCredsError: '',
            showSubmit: true
        }
    },
    methods: {
        runConfig() {
            this.$emit("run-config", {
                project: this.project,
                config: JSON.stringify(this.configData),
            });
        },
        async saveCredentialsAndRun() {
            const doRun = await this.saveCredentials();
            if (doRun) {
                this.runConfig();
            }
        },
        async saveCredentials() {
            if (!this.validateForm()) {
                return false;
            }
            const oracleDsn = this.configData.INPUT.values.ORACLE_DSN;
            const postgresDsn = this.configData.OUTPUT.values.PG_DSN;
            const testCreds = await this.testCredentials(oracleDsn, postgresDsn);
            if (oracleDsn.include && testCreds.oracle !== 'OK' ||
                postgresDsn.include && testCreds.postgres !== 'OK') {
                if (testCreds.oracle !== 'OK') {
                    this.oracleCredsError = testCreds.oracle;
                }
                if (testCreds.postgres !== 'OK') {
                    this.postgresCredsError = testCreds.postgres;
                }
                return false;
            } 
            sessionStorage.setItem(oracleDsn.value, JSON.stringify({user: this.oracleUser, pass: this.oraclePwd}));
            if (postgresDsn.include) {
                sessionStorage.setItem(postgresDsn.value, JSON.stringify({user: this.pgUser, pass: this.pgPwd}));
            }
            this.showDialog = false;
            return true;
        },
        async testCredentials(oracleDsn, postgresDsn) {
            this.showSubmit = false;
            const body = {};
            if (oracleDsn.include) {
                body.oracle = {
                    dsn: oracleDsn.value,
                    username: this.oracleUser,
                    password: this.oraclePwd
                }
            }
            if (postgresDsn.include) {
                body.postgres = {
                    dsn: postgresDsn.value,
                    username: this.pgUser,
                    password: this.pgPwd
                }
            }
            const project = this.project;
            const res = await httpClient(`/ora2pg/project/${project}/test_credentials`, {
                    method: "post",
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body)
                });
            this.showSubmit = true;
            return JSON.parse(await res.text());
        },
        validateForm() {
            this.errors.length = 0;
            if (!this.oracleUser) {
                this.errors.push('ORACLE_USER is required.');
            }
            if (!this.oraclePwd) {
                this.errors.push('ORACLE_PWD is required.');
            }
            if (this.configData.OUTPUT.values.PG_DSN.include) {
                if (!this.pgUser) {
                    this.errors.push('PG_USER is required.');
                }
                if (!this.pgPwd) {
                    this.errors.push('PG_PWD is required.');
                }
            }
            return this.errors.length === 0;
        },
        cancel() {
            this.showDialog = false;
        },
        handleAuth(callback) {
            this.runAfter = !!callback;
            const oracleDsn = this.configData.INPUT.values.ORACLE_DSN;
            const postgresDsn = this.configData.OUTPUT.values.PG_DSN;
            if (oracleDsn.include && !sessionStorage.getItem(oracleDsn.value) ||
                postgresDsn.include && !sessionStorage.getItem(postgresDsn.value)) {
                this.errors.length = 0;
                this.oracleCredsError = '';
                this.postgresCredsError = '';
                this.showDialog = true;
            } else if (callback) {
                callback();
                this.showDialog = false;
            }
        }
    }
}
</script>
<style scoped>
.pg-credentials-container {
    margin-top: 20px;
}
</style>
