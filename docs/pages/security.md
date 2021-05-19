# Securing Visulate-Ora2pg

## Build

```
docker build -t gcr.io/visulate-docker/visulate-ora2pg/ui:1.1.2 -f Dockerfile.ui .
docker build -t gcr.io/visulate-docker/visulate-ora2pg/api:1.1.2 -f Dockerfile.api .

docker push gcr.io/visulate-docker/visulate-ora2pg/ui:1.1.2
docker push gcr.io/visulate-docker/visulate-ora2pg/api:1.1.2
```

## Setup

https://cloud.google.com/endpoints/docs/openapi/get-started-compute-engine-docker-espv2

```
gcloud components update
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Create a Compute Engine VM
Edit the openapi.yaml file setting the host and x-google-endpoints values.

```
gcloud endpoints services deploy openapi.yaml
```

```
gcloud services list
```

```
gcloud services enable servicemanagement.googleapis.com
gcloud services enable servicecontrol.googleapis.com
gcloud services enable endpoints.googleapis.com
```

```
gcloud services enable ENDPOINTS_SERVICE_NAME (host from  openapi.yaml)
```

## Install Docker on VM

```
gcloud config set compute/zone us-east1-b
gcloud compute ssh INSTANCE_NAME

sudo apt-get install     apt-transport-https     ca-certificates     curl     gnupg     lsb-release

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo   "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get install docker-ce docker-ce-cli containerd.io

sudo groupadd docker
sudo usermod -aG docker $USER
```

## Deploy the API

```
docker network create --driver bridge esp_net

mkdir ora2pg-projects
docker run --name ora2pg -d -p 3000:3000 -v "$(pwd)/ora2pg-projects":/project \
 --net=esp_net gcr.io/visulate-docker/visulate-ora2pg/api:1.1.2

docker run \
  --detach \
  --name=esp2 \
  --publish=80:9000 \
  --net=esp_net \
  gcr.io/endpoints-release/endpoints-runtime:2 \
  --service=ora2pg.endpoints.visulate-iap-endpoints.cloud.goog \
  --cors_preset=basic \
  --cors_allow_origin="http://localhost:8080" \
  --http_request_timeout_s=9000 \
  --rollout_strategy=managed \
  --listener_port=9000 \
  --backend=http://ora2pg:3000
```

## Create an API Key

GCP > APIs & Services > Credentials

## Deploy UI

```
docker run -d -p 8080:80 \
--name=ora2pg-ui \
--env VUE_APP_API_BASE=**insert value here** \
--env VUE_APP_ENDPOINTS_KEY=**insert value here** \
gcr.io/visulate-docker/visulate-ora2pg/ui:1.1.2
```
