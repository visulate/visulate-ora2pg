# https://github.com/Guy-Incognito/ora2pg
FROM georgmoser/ora2pg:21.0 as ora2pg

# Build the Vue UI
FROM node:current-alpine as vue-ui
COPY /ui /ui
WORKDIR /ui
RUN npm install
RUN npm run build


# Visulate UI
FROM node:current-alpine
COPY --from=ora2pg / .

ENV ORACLE_HOME=/usr/lib/oracle/12.2/client64
ENV TNS_ADMIN=/usr/lib/oracle/12.2/client64/network/admin
ENV LD_LIBRARY_PATH=/usr/lib/oracle/12.2/client64/lib
ENV PATH=$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/oracle/12.2/client64/bin

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
