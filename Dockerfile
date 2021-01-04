#################################################################
# Adapted from https://github.com/Guy-Incognito/ora2pg/
# to pull instant client from OTN instead of a local stage area
#################################################################
FROM perl:slim

ARG ORA2PG_VERSION=21.0
ARG oracleRelease=21
ARG oracleUpdate=1
ARG otnBase=https://download.oracle.com/otn_software/linux/instantclient/211000
ARG otnVersion=21.1.0.0.0-1

# ugly fix for "update-alternatives" missing directories in slim image
RUN mkdir -p /usr/share/man/man1 &&\
    mkdir -p /usr/share/man/man7
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        unzip \
        curl \
        ca-certificates \
        rpm \
        alien \
        libaio1 \
        # Install postgresql
        postgresql-client \
        # Install mysql
        libdbd-mysql \
        #install Perl Database Interface
        libdbi-perl \
        bzip2 \
        libpq-dev

# Install ora2pg
RUN curl -L -o /tmp/ora2pg.zip https://github.com/darold/ora2pg/archive/v$ORA2PG_VERSION.zip &&\
    (cd /tmp && unzip ora2pg.zip && rm -f ora2pg.zip) &&\
    mv /tmp/ora2pg* /tmp/ora2pg &&\
    (cd /tmp/ora2pg && perl Makefile.PL && make && make install)

# Install Oracle Client
RUN mkdir /usr/lib/oracle/${oracleRelease}.${oracleUpdate}/client64/network/admin -p

RUN curl -L -o /tmp/oracle-instantclient-basic-${otnVersion}.x86_64.rpm ${otnBase}/oracle-instantclient-basic-${otnVersion}.x86_64.rpm &&\
    alien -i /tmp/oracle-instantclient-basic-${otnVersion}.x86_64.rpm

RUN curl -L -o /tmp/oracle-instantclient-devel-${otnVersion}.x86_64.rpm ${otnBase}/oracle-instantclient-devel-${otnVersion}.x86_64.rpm &&\
    alien -i /tmp/oracle-instantclient-devel-${otnVersion}.x86_64.rpm

RUN curl -L -o /tmp/oracle-instantclient-sqlplus-${otnVersion}.x86_64.rpm ${otnBase}/oracle-instantclient-sqlplus-${otnVersion}.x86_64.rpm &&\
    alien -i /tmp/oracle-instantclient-sqlplus-${otnVersion}.x86_64.rpm


# Note: Oracle v21.1 creates network/admin in '21.1' directory. bin and lib are in '21' directory
ENV ORACLE_HOME=/usr/lib/oracle/${oracleRelease}/client64
ENV TNS_ADMIN=/usr/lib/oracle/${oracleRelease}.${oracleUpdate}/client64/network/admin
ENV LD_LIBRARY_PATH=/usr/lib/oracle/${oracleRelease}/client64/lib
ENV PATH=$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/oracle/${oracleRelease}/client64/bin

# Install DBI module with Postgres and Compress::Zlib module
RUN perl -MCPAN -e 'install DBI' &&\
    perl -MCPAN -e 'install DBD::Pg' &&\
    perl -MCPAN -e 'install Bundle::Compress::Zlib'

# Install Oracle database driver
RUN curl -L https://cpan.metacpan.org/authors/id/M/MJ/MJEVANS/DBD-Oracle-1.80.tar.gz | (cd /tmp && tar -zxvf -) && \
    mv /tmp/DBD-Ora* /tmp/DBD-Oracle &&\
    cd /tmp/DBD-Oracle && perl Makefile.PL -l && make && make install

#################################################################
# Visulate-Ora2pg
# Adds an node/express based API and UI for Ora2Pg
#################################################################
FROM node:current-alpine3.12
COPY --from=0 / .

ENV ORACLE_HOME=/usr/lib/oracle/${oracleRelease}/client64
ENV TNS_ADMIN=/usr/lib/oracle/${oracleRelease}.${oracleUpdate}/client64/network/admin
ENV LD_LIBRARY_PATH=/usr/lib/oracle/${oracleRelease}/client64/lib
ENV PATH=$PATH:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/oracle/${oracleRelease}/client64/bin

# Create the project volume
RUN mkdir /project
VOLUME /project

# Install express code
COPY /express /express
WORKDIR /express
RUN npm install --production

CMD exec npm start
