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
const express = require('express');
const router = express.Router();
const fs = require('fs');
const sseUtils = require('./sse-util');
const appConfig = require('../resources/http-config');
const fileUtils = require('./file-utils');

/**
 * List projects
 */
router.get('/projects', async (req, res) => {
  const projects = await fileUtils.listProjectDirectories();
  res.json({ projects: projects });
});

/**
 * Create a project directory and copy the default config file to it
 */
router.post('/', async (req, res) => {
  const formValues = req.body;
  const project = formValues['project'];
  if (await fileUtils.fileExists(`${appConfig.projectDirectory}/${project}/config/ora2pg-conf.json`)) {
    res.status(409).send(`Project ${project} already exists`);
    return;
  }
  await fileUtils.createProjectDirectory(project);
  fs.copyFile(`${appConfig.resourceDirectory}/ora2pg-conf.json`,
    `${appConfig.projectDirectory}/${project}/config/ora2pg-conf.json`, (err) => {
      if (err) { console.log(err); }
    });
  res.status(201).send('Created');
});

/**
 * Retrieve project details
 */
router.get('/project/:project', async (req, res) => {
  const project = req.params.project;
  const configJson = await fileUtils.getConfigObject(project);
  const projectFiles = await fileUtils.listProjectFiles(project);
  res.json({ config: configJson, files: projectFiles });
});

/**
 * Save/update the config json file
 */
router.post('/:project', async (req, res) => {
  const project = req.params.project;
  const configObject = req.body;
  await fileUtils.saveConfigJson(project, configObject);
  res.status(201).send('Created');
});

/**
 * Delete project directory and all of its files
 */
router.delete('/:project', async (req, res) => {
  const project = req.params.project;
  try {
    await fs.promises.rmdir(`${appConfig.projectDirectory}/${project}`, { recursive: true });
    res.status(204).send('Deleted');
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});


/**
 * Run ora2pg
 */
router.get('/:project/exec', async (req, res) => {
  const project = req.params.project;
  try {
    sseUtils.execOra2Pg(res, project);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});


/**
 * Download file
 */
router.get('/:project/download/:file', (req, res) => {
  const project = req.params.project;
  const file = req.params.file;
  const fileToDownload = `${appConfig.projectDirectory}/${project}/${file}`;
  res.download(fileToDownload);
});


module.exports = router;
