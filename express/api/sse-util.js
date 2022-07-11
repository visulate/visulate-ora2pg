/*!
 * Copyright 2020, 2022 Visulate LLC. All Rights Reserved.
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
const { spawn } = require('child_process');
const fileUtils = require('./file-utils');
const appConfig = require('../resources/http-config');
const jose = require('jose');


function sendConflictMessage(res, project) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-control": "no-cache",
    "Connection": "keep-alive",
    "Warning": "199 - ora2pg is running"
  });
  res.connection.setTimeout(0);
  res.write("event: ora2pg\n");
  res.write('data: {"status": "error"}\n\n');
  res.write("data:ERROR creating config file\n\n");
  res.write("data:ora2pg.conf already exists\n\n");
  res.write("data:ora2pg.conf is a temporary file which gets created at the start of the run and deleted on completion.\n\n");
  res.write("data:If the file exists it means an ora2pg session is already running (or failed without cleaning up).\n\n");
  res.write("data:Wait for the other run to complete before resubmitting\n\n");
  res.write(`data:If you know that the existing ora2pg.conf is from a failed run, you may delete it by clicking the delete button <a href="/projects/${project}/details">here</a>.\n\n`);
  res.end();
}

async function execOra2Pg(res, project, authToken) {
  // Create temporary ora2pg.conf file
  const configFileStatus = await fileUtils.createConfigFile(project, authToken);
  // Validate file creation
  if (configFileStatus === 'CONFLICT') {
    sendConflictMessage(res, project);
    return;
  } else if (configFileStatus === 'NOT-FOUND') {
    res.status(404).send('Not Found');
    return;
  } else if (configFileStatus === 'MISSING-CREDENTIALS') {
    res.status(401).send('Missing credentials');
    return;
  } else if (configFileStatus === 'INVALID-CREDENTIALS') {
    res.status(403).send('Invalid credentials');
    return;
  } else if (configFileStatus === 'EXPIRED-CREDENTIALS') {
    res.status(403).send('Expired credentials');
    return;
  }

  // Initiate SSE stream
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-control": "no-cache",
    "Connection": "keep-alive"
  });
  res.connection.setTimeout(0);
  res.write("event: ora2pg\n");
  res.write('data: {"status": "running"}\n\n');

  res.write("data:Created config file\n\n");
  res.write("data:Starting ora2pg\n\n");

  // Run ora2pg
  const ora2pg = spawn('ora2pg',
    ['-c', `${appConfig.projectDirectory}/${project}/config/ora2pg.conf`],
    { cwd: `${appConfig.projectDirectory}/${project}` });

  let str = "";

  // Stream ora2pg output
  ora2pg.stdout.on('data', function (data) {
    str += data.toString();
    //Flush str buffer
    var lines = str.split("\n");
    for (var i in lines) {
      if (i == lines.length - 1) {
        str = lines[i];
      } else {
        res.write("data:" + lines[i] + "\n\n");
      }
    }
  });

  ora2pg.stderr.on('data', function (data) {
    res.write("data:" + data + "\n\n");
  });

  // Cleanup
  ora2pg.on('close', async function () {
    res.write('data:ora2pg complete\n\n');
    res.write("data:Removing config file\n\n");
    fileUtils.deleteConfigFile(project);

    const fileCount = await fileUtils.countProjectFiles(project);
    if (fileCount > 0) {
      res.write(`data:Creating compressed file ${project}.tar.gz \n\n`);
      genTarFile(res, project);

    } else {
      res.write("event: ora2pg\n");
      res.write('data: {"status": "stopped"}\n\n');
      res.end(str);
    }
  });

}

// Create compressed tar file with directory contents
async function genTarFile(res, project) {
  const tar = spawn('tar',
  ['-zcvf',
    `${appConfig.projectDirectory}/${project}/${project}.tar.gz`,
    `--exclude=./config`,
    `--exclude=./${project}.tar.gz`,
    `.`],
  { cwd: `${appConfig.projectDirectory}/${project}` });

  let str = "";

  tar.stdout.on('data', function (data) {
    str += data.toString();
    var lines = str.split("\n");
    for (var i in lines) {
      if (i == lines.length - 1) {
        str = lines[i];
      } else {
        res.write("data:" + lines[i] + "\n\n");
      }
    }
  });

  tar.stderr.on('data', function (data) {
    res.write("data:" + data + "\n\n");
  });

  tar.on('close', function () {
    res.write(`data:created file ${project}.tar.gz \n\n`);
    res.write("event: ora2pg\n");
    res.write('data: {"status": "stopped"}\n\n');
    res.end(str);
  });

}
module.exports.execOra2Pg = execOra2Pg;