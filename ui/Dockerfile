# Build the Vue UI
FROM node as build-stage
COPY . /app
WORKDIR /app
RUN npm install
RUN npm run build

# Stage distributable files
FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
