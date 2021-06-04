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
 *
 * This module adds API keys and a Bearer token authorization header to
 * http requests.
 */

// Base url, endpoint key and JWT are saved in a Vuex store
import store from '../main.js';

// The EventSource API (https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
// does not support http headers. Import an implementation that does from
// https://www.npmjs.com/package/eventsource
const EventSource = require('eventsource');

function convertEndpointToUrl(endpoint) {
  const API_BASE = store? store.state.apiBase: '';
  const ENDPOINTS_KEY = store? store.state.endpointsKey: '';
  return `${API_BASE}${endpoint}?key=${ENDPOINTS_KEY}`;
}

async function httpGet(endpoint) {
  const ID_TOKEN = store? store.state.clientId: '';
  const res = await fetch(convertEndpointToUrl(endpoint), {
    headers: {
      Authorization: `Bearer ${ID_TOKEN}`
    }
  });
  return res;
}

async function httpPost(endpoint, body) {
  const ID_TOKEN = store? store.state.clientId: '';
  const res = await fetch(convertEndpointToUrl(endpoint), {
    method: "post",
    headers: {
      Authorization: `Bearer ${ID_TOKEN}`,
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: body,
  });
  return res;
}

async function httpDelete(endpoint) {
  const ID_TOKEN = store? store.state.clientId: '';
  const res = await fetch(convertEndpointToUrl(endpoint), {
    method: "delete",
    headers: {
      Authorization: `Bearer ${ID_TOKEN}`
    }
  });
  return res;
}

function httpEventSource(endpoint) {
  const ID_TOKEN = store? store.state.clientId: '';
  const esHeader = { headers: { Authorization: `Bearer ${ID_TOKEN}` } }
  let es = new EventSource(convertEndpointToUrl(endpoint), esHeader);
  return es;
}

export { httpGet, httpPost, httpDelete, httpEventSource };