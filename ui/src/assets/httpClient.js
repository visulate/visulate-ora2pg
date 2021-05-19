async function httpClient(endpoint, customConfig) {
  const config = {
    ...customConfig,
  }

  const res = await fetch(`${process.env.VUE_APP_API_BASE}${endpoint}?key=${process.env.VUE_APP_ENDPOINTS_KEY}`, config)
  return res;
}

export default httpClient;