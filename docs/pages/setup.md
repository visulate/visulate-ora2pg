# Visulate Ora2Pg

*Run Ora2Pg + Visulate for Oracle on a Google Compute Engine VM.*

## Prerequisites

1. Firewall rules allowing ingress to the Visulate VM on tcp ports 3000 and 443.
2. [Chrome Remote Desktop host](https://cloud.google.com/architecture/chrome-desktop-remote-on-compute-engine) configured to act as a jump server.
3. Firewall rules allowing access from the Visulate VM to source (Oracle) and target (PostgreSQL) databases
4. Cloud NAT Gateway to access container repositories

## Setup Instructions

1. Use the `generate-cert.sh` script to create a self signed X.509 certificate

    ```
    hostname -f
    ora2pg.us-east1-b.c.my-gcp-project.internal

    sudo bash generate-cert.sh

    Generating a RSA private key
    .++++.......................++++
    writing new private key to 'ora2pg-key.pem'
    Enter PEM pass phrase:
    Verifying - Enter PEM pass phrase:
    -----
    You are about to be asked to enter information that will be incorporated
    into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
    -----
    Country Name (2 letter code) [AU]:US
    State or Province Name (full name) [Some-State]:Florida
    Locality Name (eg, city) []:Orlando
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:Visulate
    Organizational Unit Name (eg, section) []:Ora2Pg
    Common Name (e.g. server FQDN or YOUR name) []:ora2pg.us-east1-b.c.my-gcp-project.internal
    Email Address []:
    ```

2. Set the passphrase for use by nginx and express
    - Edit the `pw` file in the certs directory. Replace its value with the passphrase used to generate the cert
      ```
      vi certs/pw
      ```
    - Edit the `.env` file. Update the `ORA2PG_TLS_CERT_PASSPHRASE` value
      ```
      vi .env

      ORA2PG_TLS_CERT_PASSPHRASE=ora2pgkey
      ```

3. Start Visulate

    ```
    sudo bash docker-compose.sh up -d

    Creating network "visulate_default" with the default driver
    Creating visulate_ora2pg_1       ... done
    Creating visulate_reverseproxy_1 ... done
    Creating visulate_visapi_1       ... done
    Creating visulate_vissql_1       ... done
    Creating visulate_visui_1        ... done
    ```

4. Use a browser session on the remote desktop to access Visulate via its internal IP address. Access Ora2Pg on port 3000 and Visulate for Oracle on port 443.

5. Stop Visulate

    ```
    sudo bash docker-compose.sh down

    Stopping visulate_visui_1        ... done
    Stopping visulate_vissql_1       ... done
    Stopping visulate_visapi_1       ... done
    Stopping visulate_reverseproxy_1 ... done
    Stopping visulate_ora2pg_1       ... done
    Removing visulate_visui_1        ... done
    Removing visulate_vissql_1       ... done
    Removing visulate_visapi_1       ... done
    Removing visulate_reverseproxy_1 ... done
    Removing visulate_ora2pg_1       ... done
    Removing network visulate_default
    ```

6. Configure Visulate for Oracle.

  - Use the `create_user.sql` script in the `config` directory to create a Visulate account in the database(s) you want to document

    ```
    sudo bash sqlplus.sh

    SQL*Plus: Release 19.0.0.0.0 - Production on Sun Jul 24 17:49:59 2022
    Version 19.14.0.0.0

    Copyright (c) 1982, 2021, Oracle.  All rights reserved.

    Enter user-name: system/oracle@oratest.us-east1-b.c.visulate-llc-dev.internal:1521/xe

    Connected to:
    Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production

    SQL> @/config/create_user
    Enter value for password: vis1066r
    old   1: create user visulate identified by &password
    new   1: create user visulate identified by vis1066r

    User created.


    User altered.


    Grant succeeded.


    Grant succeeded.


    Grant succeeded.

    SQL>
    ```

  - Edit `database.js` file in the `config` directory with the connect details
    ```
    vi config/database.js

    const endpoints = [
    { namespace: 'testdb',
        description: 'Example endpoint',
        connect: { poolAlias: 'testdb',
                user: 'visulate',
                password: 'vis1066r',
                connectString: 'oratest.us-east1-b.c.visulate-llc-dev.internal:1521/xe',
                poolMin: 4,
                poolMax: 4,
                poolIncrement: 0
                }
    }
    ];
    ```

  - *Optional*  Edit `endpoints.json` in the `config` directory to enable query access for a database. Note: the json key must match an endpoint declared in the database.js file and the json value must match its connectString.

    ```
    vi config/endpoints.json

    {"testdb":"oratest.us-east1-b.c.visulate-llc-dev.internal:1521/xe"}
    ```

  - Restart Visulate
