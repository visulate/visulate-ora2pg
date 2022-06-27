/*!
 * Copyright 2020, 2021 Visulate LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const crypto = require('crypto');
const fs = require('fs');

const resourceDirectory = process.env.RESOURCE_DIRECTORY||process.env.PWD + '/resources'
const configTemplate = fs.readFileSync(`${resourceDirectory}/ora2pg-conf.json`);
const configTemplateObject = JSON.parse(configTemplate);

/**
 * Return environment variable or default value
 */
module.exports = {
    port: process.env.HTTP_PORT || 3000 ,
    corsOriginWhitelist: process.env.CORS_ORIGIN_WHITELIST ||'',
    projectDirectory: process.env.PROJECT_DIRECTORY||process.env.PWD + '/../project',
    resourceDirectory: resourceDirectory,
    configFileEncryptionKey: process.env.ORA2PG_SECRET||'hardCodedInsecureKey123',
    authKeyBuffer: process.env.ORA2PG_AUTH_KEY ? Buffer.from(process.env.ORA2PG_AUTH_KEY) : crypto.randomBytes(256),
    configTemplateVersion: configTemplateObject.COMMON.values.VISULATE_VERSION.value
  };
