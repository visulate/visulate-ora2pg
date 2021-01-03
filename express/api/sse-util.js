/*!
 * Copyright 2020 Visulate LLC. All Rights Reserved.
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

function sendConflictMessage(res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-control": "no-cache",
    "Connection": "keep-alive"
  });
  res.connection.setTimeout(0);
  res.write("event: ora2pg\n");
  res.write('data: {"status": "error"}\n\n');
  res.write("data:ERROR creating config file\n\n");
  res.write("data:ora2pg.conf already exists\n\n");
  res.write("data:ora2pg.conf is a temporary file which gets created at the start of the run and deleted on completion.\n\n");
  res.write("data:If the file exists it means an ora2pg session is already running (or failed without cleaning up).\n\n");
  res.write("data:Wait for the other run to complete before resubmitting\n\n");
  res.end();
}


async function execOra2Pg(res, project) {
  const configFileStatus = await fileUtils.createConfigFile(project);
  if (configFileStatus === 'CONFLICT') {
    sendConflictMessage(res);
    return;
  }

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


  const ora2pg = spawn('ora2pg',
    ['-c', `${appConfig.projectDirectory}/${project}/config/ora2pg.conf`],
    { cwd: `${appConfig.projectDirectory}/${project}` });

  let str = "";

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

  ora2pg.on('close', function () {

    res.write('data:ora2pg complete\n\n');
    res.write("data:Removing config file\n\n");
    fileUtils.deleteConfigFile(project);
    res.write("event: ora2pg\n");
    res.write('data: {"status": "stopped"}\n\n');
    res.end(str);
  });

  ora2pg.stderr.on('data', function (data) {
    res.write("data:" + data + "\n\n");
  });

}
module.exports.execOra2Pg = execOra2Pg;