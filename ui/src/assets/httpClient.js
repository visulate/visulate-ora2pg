async function httpClient(endpoint, customConfig) {
  const apiBase = process.env.VUE_APP_API_BASE || '';
  const queryParams = process.env.VUE_APP_ENDPOINTS_KEY ? `?key=${process.env.VUE_APP_ENDPOINTS_KEY}` : '';
  const config = {
    ...customConfig,
  }

  const res = await fetch(`${apiBase}${endpoint}${queryParams}`, config)
  return res;
}

export default httpClient;