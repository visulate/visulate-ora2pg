import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'
import '../node_modules/material-design-lite/material.min.css'
import '../node_modules/material-design-lite/material.min.js'
import gAuthPlugin from 'vue3-google-oauth2';

const app = createApp(App);
app.use(gAuthPlugin, { clientId: process.env.VUE_APP_GAUTH_CLIENT_ID, scope: 'email', prompt: 'consent', fetch_basic_profile: false });

app.mount('#app');