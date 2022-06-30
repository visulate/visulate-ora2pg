## Problem Description

Database credentials are stored in the Ora2Pg configuration file, potentially exposing a security risk for users of Visulate Ora2Pg who are running the application on a shared server.

## Solution

Store the credentials client-side and only submit them to the server when needed for running Ora2Pg. When submitting credentials to the `/exec` request, encode them to avoid exposing credentials in the URL.

## Business Need

Some users may be using the application on a shared server and need to avoid exposing high-level database credentials.

## Requirements

### Functional Requirements

1. Customer Requirements

    ​To be able to run Visulate Ora2Pg on a shared server without potentially exposing users' credentials to other users.		

2. Use Cases

    - **Action**: User clicks Run without having entered credentials. 
    **Expected result**: A dialog will appear prompting the user for their credentials, which will then be stored in session storage.

    - **Action**: User clicks Run having already entered credentials during the current session.
    **Expected result**: Ora2Pg will run without asking for credentials.

    - **Action**: User changes the Oracle or Postgres DSN after having entered credentials for a different DSN.
    **Expected result**: The dialog will reappear to request credentials again for the new DSN(s).

    - **Action**: User enables the Oracle or Postgres DSN and has not previously entered credentials for this DSN.
    **Expected result**: The dialog will reappear to request credentials again for the new DSN(s).

    - **Action**: User clicks Run in using an input file rather than a database (`ORACLE_DSN` is disabled).
    **Expected result**: Ora2Pg will run without asking for credentials.

    **Action**: User clicks the Test Connection button(s) in the authentication dialog after entering their credentials correctly.
    **Expected result**: After confirming the connection the Test Connection button will turn into a message saying Connection OK

    **Action** User clicks the Test Connection button(s) in the authentication dialog after entering their credentials incorrectly.
    **Expected result**: After failing to connect a message will appear saying connection failed and the Test Connection button will still appear

3. Functionality and Feature Description

    **​Current behavior**: The configuration for a project is stored in a file called ora2pg-conf.json. This includes the username(s) and password(s) to Oracle and PostgreSQL databases. It is encrypted when stored on the server, but gets decrypted and sent to the client when a project is selected in Visulate Ora2Pg. This exposes a security risk for users on a shared server, as anyone with access to the server could gain credentials for projects other than their own.

    **​New functionality**: The user will be prompted for their credentials via a dialog and these will be stored in session storage and only sent to the server when needed for running Ora2Pg. To avoid exposing the credentials in a URL (since `/exec` is a `GET` request) the credentials will be `POST`ed to a separate endpoint `/credentials` which will return a JWT containing the credentials. The JWT is then included in the URL for the `/exec` request.
    Test Connection buttons should appear under the credentials inputs for Oracle and Postgres in the auth dialog. Clicking these buttons will use a perl module to test the connections to Oracle and Postgres.

    **​New concepts**: JWTs are used to encode the credentials for submitting to the `/exec` request.

    **​User Interface**: A new dialog is needed to allow the user to enter their credentials.

4. Limitations

    Users will have to re-enter their database credentials when starting a new session.

5. Dependencies and Impact Analysis

    The `jose` NPM module is needed to encode/decode the credentials (JWT).

    A data migration is required so that the `ORACLE_USER` and `PG_USER` fields will no longer appear in the UI, and so the user can be prompted for credentials when `ORACLE_DSN` or `PG_DSN` changes.			

### User Interface Requirements

​When the user clicks 'Run' or enables or changes the value of `ORACLE_DSN` or `PG_DSN`, a dialog should appear requesting their credentials, unless the credentials are already saved in session storage (credentials are keyed by DSN). Postgres credentials should only be requested if `PG_DSN` is enabled. The dialog should perform validation to require username/password for the enabled database(s).

## Design

### Data Model

#### Schema Changes

​A new `type` property will be added to `ORACLE_DSN`, `ORACLE_USER`, `PG_DSN`, and `PG_USER`. The DSN fields will have a type of `'dsn'` and the username fields will have a type of `'username'`. This is necessary so that the UI can perform custom logic to hide the username field and prompt for credentials when the DSN field's value changes (if needed).

#### Data Upgrade

​A new field VISULATE_VERSION will be added under the COMMON section of the configuration. When its value updates, existing project config files need to be replaced with this new template, with the user-entered data from the old config files being merged into the new file. This can be done by simply recursively iterating over the properties the new config object and whenever a property has a key of `value` or `include`, copy the value for that property from the old config.

### Code

#### APIs

​A new `/credentials` endpoint will be added which takes the user's credentials as its body and signs and returns a JWT containing the credentials. The JWT's expiration will be set for 5 minutes.

​The `/exec` endpoint will take a new query parameter `T` containing the credentials JWT.

​When executing Ora2Pg, the JWT (parameter `T` from above) will be passed to sse-utils.js and ultimately file-utils.js where it will be decoded and merged into the configuration file before running Ora2Pg.	

### User Interface

​When the user clicks Run, check the session storage for credentials for the current DSN(s) and if absent prompt using the authentication dialog. Also check session storage/display the dialog when `ORACLE_DSN` or `PG_DSN` become enabled, or when their inputs are blurred.

## Test Plans

Test the new `/credentials` endpoint.

Currently all tests that execute Ora2Pg are using File Mode, so we do not have the means to test the code path that merges the credentials into the file. We can, however confirm that credentials are **not** required in File Mode.

Future: add UI tests and test the authentication dialog.

