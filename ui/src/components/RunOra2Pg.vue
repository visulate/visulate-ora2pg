<template>
  <div data-cy="run_page">
    <div class="action-menu">
      <b>Output</b>
      <span>
        <div class="spinner" v-show="ora2pgRunning"></div>
        <button
          class="mdl-button mdl-js-button mdl-button"
          v-show="!ora2pgRunning"
          @click.prevent="closeComponent()"
          data-cy="close_run">
          Close
        </button>
      </span>
    </div>
    <pre><code v-html="outputText"></code></pre>
  </div>
</template>
<script>
import httpClient from '../assets/httpClient';
export default {
  name: "RunOra2Pg",
  emits: ["close-component", "run-started", "run-complete"],
  props: {
    project: {
      type: String,
    },
    config: {
      type: Object
    }
  },
  data() {
    return {
      outputText: "",
      ora2pgRunning: false,
    };
  },
  created() {
    this.setupStream();
    this.$emit('run-started');
  },
  methods: {
    async retrieveJwt() {
      // Read the credentials from session storage
      const oracleCredentialData = JSON.parse(sessionStorage.getItem(this.config.INPUT.values.ORACLE_DSN.value));
      const pgCredentialData = JSON.parse(sessionStorage.getItem(this.config.OUTPUT.values.PG_DSN.value));
      const body = {};
      if (oracleCredentialData) {
        body.ORACLE_USER = oracleCredentialData.user;
        body.ORACLE_PWD = oracleCredentialData.pass;
      }
      if (pgCredentialData) {
        body.PG_USER = pgCredentialData.user;
        body.PG_PWD = pgCredentialData.pass;
      }
      // Post credentials to generate a JWT
      const jwtResponse = await httpClient(`/ora2pg/project/${this.project}/credentials`, {
        method: "post",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      });
      return await jwtResponse.text();
    },
    async setupStream() {
      const jwt = await this.retrieveJwt();
      const apiBase = process.env.VUE_APP_API_BASE || '';
      const queryParams = process.env.VUE_APP_ENDPOINTS_KEY ? 
        `?key=${process.env.VUE_APP_ENDPOINTS_KEY}&T=${jwt}` : `?T=${jwt}`;
      let es = new EventSource(`${apiBase}/ora2pg/project/${this.project}/exec${queryParams}`);

      es.addEventListener(
        "message",
        (event) => {
          this.outputText += `${event.data}\n`;
        },
        false
      );

      es.addEventListener(
        "ora2pg",
        (event) => {
          const eventData = JSON.parse(event.data);
          this.ora2pgRunning = eventData.status === "running" ? true : false;
          if (!this.ora2pgRunning) {
            this.$emit('run-complete');
          }
        },
        false
      );

      es.addEventListener(
        "error",
        () => {
          es.close();
        },
        false
      );
    },
    closeComponent() {
      this.$emit("close-component");
    },
  },
};
</script>