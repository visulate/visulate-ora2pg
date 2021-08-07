/*!
 * Copyright 2021 Visulate LLC. All Rights Reserved.
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

import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import './assets/style.css'
import '../node_modules/material-design-lite/material.min.css'
import '../node_modules/material-design-lite/material.min.js'

import gAuthPlugin from 'vue3-google-oauth2';

const store = createStore({
  state: {
    apiBase: process.env.VUE_APP_API_BASE,
    endpointsKey: process.env.VUE_APP_ENDPOINTS_KEY,
    clientId: ''
  },
  mutations: {
    setClientId(state, jwt) {
      state.clientId = jwt
    }
  }
});

const app = createApp(App);
app.use(gAuthPlugin, {
  clientId: process.env.VUE_APP_GAUTH_CLIENT_ID,
  scope: 'email', prompt: 'consent',
  fetch_basic_profile: false
});
app.use(store);
app.mount('#app');

export default store;