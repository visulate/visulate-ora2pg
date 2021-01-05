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
var path = require('path');
const handlebars = require('handlebars');
const appConfig = require('../resources/http-config');

/**
 * Read the ora2pg-conf.json file and return as an object
 *
 * @param {*} project
 */
async function getConfigObject(project) {
  try {
    const config = await fs.promises.readFile(`${appConfig.projectDirectory}/${project}/config/ora2pg-conf.json`)
    return JSON.parse(config);
  } catch (e) {
    console.error(e);
  }
}
module.exports.getConfigObject = getConfigObject;

/**
 * Write the ora2pg-conf.json file in the project directory
 *
 * @param {*} project
 * @param {*} configObject
 */
async function saveConfigJson(project, configObject) {
  try {
    const configStr = JSON.stringify(configObject);
    await fs.promises.writeFile(`${appConfig.projectDirectory}/${project}/config/ora2pg-conf.json`, configStr);
  } catch (e) {
    console.error(e);
  }
}
module.exports.saveConfigJson = saveConfigJson;

/**
 * Write the configObject as an ora2pg.conf file in the project directory
 *
 * @param {*} project
 * @param {*} configObject
 */
async function saveConfigFile(project, configObject) {
  try {
    const tpl = await fs.promises.readFile(`${appConfig.resourceDirectory}/ora2pg-config-file.hbs`, "utf8");
    const compiledTemplate = handlebars.compile(tpl);
    const configFile = compiledTemplate({ config: configObject });
    await fs.promises.writeFile(`${appConfig.projectDirectory}/${project}/config/ora2pg.conf`, configFile);
  } catch (e) {
    console.error(e);
  }
}
module.exports.saveConfigFile = saveConfigFile;

/**
 * Create an ora2pg-conf file. Wrapper function for saveConfigFile
 *
 * @param {*} project
 */
async function createConfigFile(project) {
  try {
    if (await fileExists(`${appConfig.projectDirectory}/${project}/config/ora2pg.conf`)) {
      return('CONFLICT');
    } else {
      const config = await getConfigObject(project);
      await saveConfigFile(project, config);
      return('CREATED');
    }
  } catch (e) {
    console.error(e);
  }
}
module.exports.createConfigFile = createConfigFile;

/**
 * Delete the project's ora2pg.conf file
 * @param {*} project
 */
function deleteConfigFile(project) {
  fs.unlink(`${appConfig.projectDirectory}/${project}/config/ora2pg.conf`, (err) => {
    if (err) console.error(err);
  });
}
module.exports.deleteConfigFile = deleteConfigFile;

/**
 * Returns true if file exists else false
 * @param {*} file
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
 * @param {*} project
 */
async function createProjectDirectory(project) {
  await fs.promises.mkdir(`${appConfig.projectDirectory}/${project}/config`, { recursive: true }, (err) => {
    if (err && err.code != 'EEXIST') console.error(err);
    return;
  });
}
module.exports.createProjectDirectory = createProjectDirectory;

/**
 * List the project directories
 */
async function listProjectDirectories() {
  try {
    const dirContents = await fs.promises.readdir(`${appConfig.projectDirectory}`);
    return dirContents.filter(f => fs.statSync(path.join(`${appConfig.projectDirectory}/`, f)).isDirectory());
  } catch (e) {
    console.error(e);
  }
}
module.exports.listProjectDirectories = listProjectDirectories;

/**
 * Read the files in a project directory
 *
 * @param {*} project
 */
async function listProjectFiles(project) {
  try {
    const dirContents = await fs.promises.readdir(`${appConfig.projectDirectory}/${project}`);
    return dirContents.filter(f => fs.statSync(path.join(`${appConfig.projectDirectory}/${project}/`, f)).isFile());
  } catch (e) {
    console.error(e);
  }
}
module.exports.listProjectFiles = listProjectFiles;
