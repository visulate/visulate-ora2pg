# https://github.com/Guy-Incognito/ora2pg
FROM georgmoser/ora2pg:21.0

# Visulate UI
FROM node:current-alpine
COPY --from=0 / .

ENV ORACLE_HOME=/usr/lib/oracle/12.2/client64
ENV TNS_ADMIN=/usr/lib/oracle/12.2/client64/network/admin
ENV LD_LIBRARY_PATH=/usr/lib/oracle/12.2/client64/lib
ENV PATH=$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/oracle/12.2/client64/bin

# Create the project volume
RUN mkdir /project
VOLUME /project

# Install express code
COPY /express /express
WORKDIR /express
RUN npm install --production

CMD exec npm start
