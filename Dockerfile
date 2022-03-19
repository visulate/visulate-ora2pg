# Build the Vue UI

FROM node:16-alpine as vue-ui
COPY /ui ./ui
WORKDIR /ui
RUN npm install
RUN npm run build

# Setup express server
FROM georgmoser/ora2pg:23.1

# Install Node JS
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

# Create the project volume
RUN mkdir /project
VOLUME /project

# Install express code
COPY /express /express

# Remove vue-ui source
RUN mkdir /express/ui
COPY --from=vue-ui /ui/dist /express/ui/dist

# Install and run
WORKDIR /express
RUN npm install --production

CMD exec npm start
