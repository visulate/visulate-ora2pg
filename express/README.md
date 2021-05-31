# Ora2Pg API server

Use `sed` to generate an Google Cloud Endpoints openapi spec from openapi.template.yaml

```
sed -e 's/{{CLOUD-ENDPOINTS-SERVICE_NAME}}/ora2pg.endpoints.visulate-iap-endpoints.cloud.goog/' \
    -e 's/{{VM-INSTANCE-IP-ADDRESS}}/35.231.22.231/' \
    -e 's/{{GAUTH_CLIENT_ID}}/298820748354-qfl9ih4oh92ndvgui3e9kqobgruqha03.apps.googleusercontent.com/' \
    <openapi.template.yaml >openapi.yaml
```