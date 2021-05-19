<template>
  <div>
    <div class="action-menu">
      <b>Output</b>
      <span>
        <div class="spinner" v-show="ora2pgRunning"></div>
        <button
          class="mdl-button mdl-js-button mdl-button"
          v-show="!ora2pgRunning"
          @click.prevent="closeComponent()"
        >
          Close
        </button>
      </span>
    </div>
    <pre><code>{{outputText}}</code></pre>
  </div>
</template>
<script>
export default {
  name: "RunOra2Pg",
  emits: ["close-component"],
  props: {
    project: {
      type: String,
    },
  },
  data() {
    return {
      outputText: "",
      ora2pgRunning: false,
    };
  },
  created() {
    this.setupStream();
  },
  methods: {
    setupStream() {
      let es = new EventSource(`${process.env.VUE_APP_API_BASE}/ora2pg/project/${this.project}/exec?key=${process.env.VUE_APP_ENDPOINTS_KEY}`);

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