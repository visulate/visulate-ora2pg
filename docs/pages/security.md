* TOC
{:toc id="toc"}

# Securing Visulate-Ora2pg

This page describes how to secure a visulate-ora2pg deployment using [Google Cloud Endpoints](https://cloud.google.com/endpoints). It is based on the [Endpoints on Compute Engine with ESPv2](https://cloud.google.com/endpoints/docs/openapi/get-started-compute-engine-docker-espv2) tutorial.

## Build

Build and stage separate images for the UI and API servers

```
cd $PROJECT_ROOT/ui
docker build -t gcr.io/visulate-docker/visulate-ora2pg/ui:2.0.0 .
cd $PROJECT_ROOT/express
docker build -t gcr.io/visulate-docker/visulate-ora2pg/api:2.0.0 .

docker push gcr.io/visulate-docker/visulate-ora2pg/ui:2.0.0
docker push gcr.io/visulate-docker/visulate-ora2pg/api:2.0.0
```

## Setup

Create a Compute Engine VM and register the Ora2Pg API

```
gcloud components update
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Create a Compute Engine VM

Machine type: e2-medium (2 vCPUs, 4 GB memory). Boot image: Debian 10 Buster. Make a note of the external IP address for later use.

### Create an OAuth 2 Client Id

Navigate to the API credentials screen (GCP > APIs & Services > Credentials). Create an OAuth client ID of type "Web application". Make a note of the Client ID on the right of the screen.

![OAuth2 Client ID screen](/images/oauth2-client_id.png){: class="screenshot" }

### API Registration

Cloud Endpoints uses an Openapi v2 specification for API registration. It includes [custom extensions](https://cloud.google.com/endpoints/docs/openapi/openapi-extensions) to describe desired Cloud Endpoints behavior.

Visulate includes a template with substitution variables for the custom extensions. The template is called `openapi.template.yaml` and is located in the visulate-ora2pg/express directory. Use the unix sed command to generate an Google Cloud Endpoints openapi spec from openapi.template.yaml. Example:

```
sed -e 's/{{CLOUD-ENDPOINTS-SERVICE_NAME}}/ora2pg.endpoints.visulate-iap.cloud.goog/' \
    -e 's/{{VM-INSTANCE-IP-ADDRESS}}/35.231.22.231/' \
    -e 's/{{GAUTH_CLIENT_ID}}/298820348354-qjl9ih5oh02ndvgui3e9kqobgruqha03.apps.googleusercontent.com/' \
    <openapi.template.yaml >openapi.yaml
```

Where CLOUD-ENDPOINTS-SERVICE_NAME is in the form `API-NAME`.endpoints.`GCP-PROJECT-ID`.cloud.goog,  VM-INSTANCE-IP-ADDRESS and GAUTH_CLIENT_ID are the values identified in previous steps. The output of the sed command should be a new file called openapi.yaml. Use this file to register the API with Cloud Endpoints.

Open the file and make sure allowCors property is set to True.

``` yaml
x-google-endpoints:
- name: "ora2pg.endpoints.visulate-iap.cloud.goog"
  target: "35.231.22.231"
  # Comment/Uncomment as required
  allowCors: True
```

Register the API with Cloud Endpoints:

```
gcloud endpoints services deploy openapi.yaml
```

**Note** you can edit the openapi.yaml file and re-run `gcloud endpoints services deploy openapi.yaml` to change the Cloud Endpoints behavior.

### Enable the Endpoints Service

Cloud Endpoints requires servicemanagement.googleapis.com, servicecontrol.googleapis.com and endpoints.googleapis.com to be enabled. Use gcloud services commands to identify the services that are currently enabled in your project and enable if required. Example:

```
gcloud services list

gcloud services enable servicemanagement.googleapis.com
gcloud services enable servicecontrol.googleapis.com
gcloud services enable endpoints.googleapis.com
```

Next, enable the API that you registered in the previous step

```
gcloud services enable CLOUD_ENDPOINTS_SERVICE_NAME

# Example:
# gcloud services enable ora2pg.endpoints.visulate-iap.cloud.goog
```

## Install Docker on VM

This deployment uses Google's Extensible Service Proxy V2 (ESPv2) running in a prebuilt Docker container. Use the following steps to install Docker on the VM.

Login to the VM

```
gcloud config set compute/zone us-east1-b
gcloud compute ssh INSTANCE_NAME
```

Install Docker

```
sudo apt-get install     apt-transport-https     ca-certificates     curl     gnupg     lsb-release

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo   "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get install docker-ce docker-ce-cli containerd.io
```

(Optional) add your user to the docker group

```
sudo groupadd docker
sudo usermod -aG docker $USER
```

## Deploy ESPv2 and the API Backend

Create a bridge network

```
docker network create --driver bridge esp_net
```

Deploy the API backend

```
mkdir ora2pg-projects
docker run --name ora2pg -d -p 3000:3000 -v "$(pwd)/ora2pg-projects":/project \
 --net=esp_net gcr.io/visulate-docker/visulate-ora2pg/api:2.0.0
```

Deploy an ESPv2 proxy for the backend passing a listener port binding (80 in the example below), CORS origin (http://localhost:8080) and CLOUD_ENDPOINTS_SERVICE_NAME (ora2pg.endpoints.visulate-iap.cloud.goog)

```
docker run \
  --detach \
  --name=esp2 \
  --publish=80:9000 \
  --net=esp_net \
  gcr.io/endpoints-release/endpoints-runtime:2 \
  --service=ora2pg.endpoints.visulate-iap.cloud.goog \
  --cors_preset=basic \
  --cors_allow_origin="http://localhost:8080" \
  --http_request_timeout_s=9000 \
  --rollout_strategy=managed \
  --listener_port=9000 \
  --backend=http://ora2pg:3000
```

## Deploy UI

The UI is deployed from a Docker image.

### Create an API Key

The openapi.yaml document generated in the [API Registration](#api-registration) step specifies API Key and OAuth 2 security for each endpoint.

Navigate to the API credentials screen in your project (GCP > APIs & Services > Credentials) and create a credential of type API Key. Make a note of the key for use during UI deployment.

### Add a CORS origin to your OAuth client

Open the Client ID you created in the [Create an OAuth 2 Client ID](#create-an-oauth-2-client-id) step and add your deployment URI to the list of Authorized JavaScript origins. This should match the value you supplied when you started the ESPv2 proxy container.

### Start the UI

Create a docker container passing environment variables for the ESPv2 proxy URL, API key and OAuth2 Client ID.

```
docker run -d -p 8080:80 \
--name=ora2pg-ui \
--env VUE_APP_API_BASE=**insert value here** \
--env VUE_APP_ENDPOINTS_KEY=**insert value here** \
--env VUE_APP_GAUTH_CLIENT_ID=**insert value here** \
gcr.io/visulate-docker/visulate-ora2pg/ui:2.0.0
```
