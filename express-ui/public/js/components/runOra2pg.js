app.component('runOra2pg', {
  name: 'runOra2pg',
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