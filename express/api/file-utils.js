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
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const appConfig = require('../resources/http-config');

// ora2pg-conf.json is file to prevent saving Oracle and Postgres
// database credentials in clear text using code based on this post:
// https://medium.com/@anned20/encrypting-files-with-nodejs-a54a0736a50a
const crypto = require('crypto');
const encryptionAlgorithm = 'aes-256-ctr';
let encryptionKey = appConfig.configFileEncryptionKey;
encryptionKey = crypto.createHash('sha256').update(encryptionKey).digest('base64').substr(0, 32);

/**
 * Encrypt a character string buffer
 * @param {buffer} buffer
 */
function encrypt(buffer) {
  const initializationVector = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(encryptionAlgorithm, encryptionKey, initializationVector);
  return Buffer.concat([initializationVector, cipher.update(buffer), cipher.final()]);
}
module.exports.encrypt = encrypt;

/**
 * Decrypt an aes-256-ctr encrypted file
 * @param {*} encrypted
 */
function decrypt(encrypted) {
  // initializationVector is the first 16 bytes
  const initializationVector = encrypted.slice(0, 16);
  encryptedContent = encrypted.slice(16);
  const decipher = crypto.createDecipheriv(encryptionAlgorithm, encryptionKey, initializationVector);
  return Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
}
module.exports.decrypt = decrypt;

/**
 * Validate the top level keys in the ora2pg-conf.json object
 * @param {Object} configObject
 */
function validKeys(configObject) {
  const validKeys = ["COMMON", "INPUT", "SCHEMA", "ENCODING", "EXPORT", "FULL_TEXT_SEARCH", "DATA_DIFF",
    "CONSTRAINT", "TRIGGERS_AND_SEQUENCES", "OBJECT_MODIFICATION", "OUTPUT", "TYPE","GRANT", "DATA",
    "PERFORMANCE", "PLSQL", "ASSESSMENT", "POSTGRESQL", "SPATIAL", "FDW", "MYSQL"];
  const configObjectKeys = Object.keys(configObject);
  let i = validKeys.length;
  while (i--) {
    if (validKeys[i] !== configObjectKeys[i]) return false;
  }
  return true;
}
module.exports.validKeys = validKeys;

/**
 * Read the ora2pg-conf.json file and return as an object
 *
 * @param {string} project
 */
async function getConfigObject(project) {
  if (! await fileExists(`${appConfig.projectDirectory}/${project}/config/ora2pg-conf.json.enc`)) {
    await seedProjectConfigFile(project);
  }
  const encryptedConfig = await fs.promises.readFile(`${appConfig.projectDirectory}/${project}/config/ora2pg-conf.json.enc`);
  const config = decrypt(encryptedConfig);
  try {
    const configObject = JSON.parse(config);
    if (configObject && typeof configObject === "object") {
      return configObject;
    }
  } catch (e) {}
  return false;
}
module.exports.getConfigObject = getConfigObject;

/**
 * Write the ora2pg-conf.json file in the project directory
 *
 * @param {string} project
 * @param {object} configObject
 */
async function saveConfigJson(project, configObject) {
  const configStrBuffer = Buffer.from(JSON.stringify(configObject));
  const encryptedConfig = encrypt(configStrBuffer);
  await fs.promises.writeFile(`${appConfig.projectDirectory}/${project}/config/ora2pg-conf.json.enc`, encryptedConfig);
}
module.exports.saveConfigJson = saveConfigJson;

/**
 * Write the configObject as an ora2pg.conf file in the project directory
 *
 * @param {string} project
 * @param {object} configObject
 */
async function saveConfigFile(project, configObject) {
  const tpl = await fs.promises.readFile(`${appConfig.resourceDirectory}/ora2pg-config-file.hbs`, "utf8");
  const compiledTemplate = handlebars.compile(tpl);
  const configFile = compiledTemplate({ config: configObject });
  await fs.promises.writeFile(`${appConfig.projectDirectory}/${project}/config/ora2pg.conf`, configFile);
}
module.exports.saveConfigFile = saveConfigFile;

/**
 * Create an ora2pg-conf file.
 * Wrapper function for saveConfigFile to prevent 2 sessions running at the same time.
 *
 * @param {string} project
 */
async function createConfigFile(project) {
  if (! await fileExists(`${appConfig.projectDirectory}/${project}/config/`)) {
    return ('NOT-FOUND')
  } else if (await fileExists(`${appConfig.projectDirectory}/${project}/config/ora2pg.conf`)) {
    return ('CONFLICT');
  } else {
    const config = await getConfigObject(project);
    await saveConfigFile(project, config);
    return ('CREATED');
  }
}
module.exports.createConfigFile = createConfigFile;

/**
 * Delete the project's ora2pg.conf file
 * @param {string} project
 */
function deleteConfigFile(project) {
  fs.unlink(`${appConfig.projectDirectory}/${project}/config/ora2pg.conf`, (err) => {
    if (err) console.error(err);
  });
}
module.exports.deleteConfigFile = deleteConfigFile;

/**
 * Returns true if file exists else false
 * @param {string} file
 */
async function fileExists(file) {
  return fs.promises.access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}
module.exports.fileExists = fileExists;

/**
 * Create a project directory
 *
 * @param {string} project
 */
async function createProjectDirectory(project) {
  await fs.promises.mkdir(`${appConfig.projectDirectory}/${project}/config`, { recursive: true }, (err) => {
    if (err && err.code != 'EEXIST') console.error(err);
    return ;
  });
}
module.exports.createProjectDirectory = createProjectDirectory;

async function seedProjectConfigFile(project) {
  const config = await fs.promises.readFile(`${appConfig.resourceDirectory}/ora2pg-conf.json`);
  await saveConfigJson(project, JSON.parse(config));
  return;
}
module.exports.seedProjectConfigFile = seedProjectConfigFile;


/**
 * List the project directories
 */
async function listProjectDirectories() {
  const dirContents = await fs.promises.readdir(`${appConfig.projectDirectory}`);
  return dirContents.filter(f => fs.statSync(path.join(`${appConfig.projectDirectory}/`, f)).isDirectory());
}
module.exports.listProjectDirectories = listProjectDirectories;

/**
 * Read the files in a project directory
 *
 * @param {string} project
 */
async function listProjectFiles(project) {
  const dirContents = await fs.promises.readdir(`${appConfig.projectDirectory}/${project}`);
  return {
    files: dirContents.filter(f => fs.statSync(path.join(`${appConfig.projectDirectory}/${project}/`, f)).isFile()),
    directories: dirContents.filter(f =>
      fs.statSync(path.join(`${appConfig.projectDirectory}/${project}/`, f)).isDirectory() &&
      f !== 'config' )
  }
}
module.exports.listProjectFiles = listProjectFiles;

/**
 * Count files and directories in project directory
 *
 * @param {string} project
 */
async function countProjectFiles(project){
  const dirContents = await fs.promises.readdir(`${appConfig.projectDirectory}/${project}`);
  return dirContents.length -1; // ignore the config directory
}
module.exports.countProjectFiles = countProjectFiles;