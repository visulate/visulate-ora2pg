import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import '../node_modules/material-design-lite/material.min.css'
import '../node_modules/material-design-lite/material.min.js'
import { router } from './router'

const app = createApp(App);
app.use(router);
app.mount('#app')
