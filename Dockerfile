# Build the Vue UI
FROM node:current-alpine as vue-ui
ENV  NODE_OPTIONS=--openssl-legacy-provider

COPY /ui /ui
WORKDIR /ui
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && npm install \
    && npm run build \
    && apk del .gyp

FROM georgmoser/ora2pg:23.0

# Install Node JS
RUN curl -sL https://deb.nodesource.com/setup_current.x | bash -
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
