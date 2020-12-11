const express = require('express');
const router = express.Router();
const exec = require('child_process').exec;
const fs = require('fs');
const appRoot = process.cwd();
const child_process = require('child_process');
const handlebars = require('handlebars');

const getConfigObject = function (project) {
  const config = fs.readFileSync(`${appRoot}/output/${project}/ora2pg-conf.json`)
  return JSON.parse(config);
}

const saveConfigJson = function (project, configObject) {
  const configStr = JSON.stringify(configObject);
  fs.writeFileSync(`${appRoot}/output/${project}/ora2pg-conf.json`, configStr);
}

const saveConfigFile = function (project, configObject) {
  const tpl = fs.readFileSync(`${appRoot}/views/ora2pg-config-file.hbs`, "utf8");
  const compiledTemplate = handlebars.compile(tpl);
  const configFile = compiledTemplate({ config: configObject });
  fs.writeFileSync(`${appRoot}/output/${project}/ora2pg.conf`, configFile);
}

const createProjectDirectory = function (project) {
  fs.mkdirSync(`${appRoot}/output/${project}`, { recursive: true }, (err) => {
    if (err && err.code != 'EEXIST') throw err;
    return;
  });
}

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/', async (req, res) => {
  const formValues = req.body;
  const project = formValues['project'];
  createProjectDirectory(project);
  fs.copyFile(`${appRoot}/resources/ora2pg-conf.json`,
    `${appRoot}/output/${project}/ora2pg-conf.json`, (err) => {
      if (err) { console.log(err); }
      else { res.redirect(`/ora2pg/${project}`) }
    });
});

router.get('/:project', function (req, res) {
  const project = req.params.project;
  const configJson = getConfigObject(project);
  res.render('ora2pg-config', { config: configJson, project: { name: project } });

});

router.post('/:project', function (req, res) {
  const project = req.params.project;
  let configObject = getConfigObject(project);
  const formValues = req.body;
  Object.entries(configObject).forEach(([section, values]) => {
    Object.keys(values.values).forEach((parameter) => {
      if (formValues[parameter]) {
        configObject[section].values[parameter].value = formValues[parameter];
        configObject[section].values[parameter].suppress = false;
      } else {
        configObject[section].values[parameter].suppress = true;
      }
    });
  });

  saveConfigJson(project, configObject);
  saveConfigFile(project, configObject);

  res.redirect(`/ora2pg/${project}`)

});

router.get('/:project/ping', (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-control": "no-cache"
  });

  var spw = child_process.spawn('pwd', [], { cwd: "/home/pgoldtho" });
    str = "";

  spw.stdout.on('data', function (data) {
    str += data.toString();
    //Flush str buffer
    var lines = str.split("\n");
    for (var i in lines) {
      if (i === lines.length - 1) {
        str = lines[i];
      } else {
        res.write(lines[i] + "\n");
      }
    }
  });

  spw.on('close', function (code) {
    res.end(str);
  });

  spw.stderr.on('data', function (data) {
    res.end('stderr: ' + data);
  });
});

const sendHeartbeat = function(res) {
  res.write("\n\n");
}

router.get('/:project/exec', async function (req, res) {
  const project = req.params.project;
  // req.setTimeout(3600000);
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-control": "no-cache",
    "Connection": "keep-alive"
  });
  res.connection.setTimeout(0);
  // res.flushHeaders();

  // let keepAliveMS = 60 * 1000;

  // function keepAlive() {
  //   // SSE comment for keep alive. Chrome times out after two minutes.
  //   console.log('keepAlive');
  //   res.write(':\n\n');
  //   setTimeout(keepAlive, keepAliveMS);
  // }

  // keepAliveTimeout = setTimeout(keepAlive, keepAliveMS);

  var spw = child_process.spawn('ora2pg', ['-c', `${appRoot}/output/${project}/ora2pg.conf`], { cwd: `${appRoot}/output/${project}` });
  var str = "";

  spw.stdout.on('data', function (data) {
    str += data.toString();
    //Flush str buffer
    var lines = str.split("\n");
    for (var i in lines) {
      if (i == lines.length - 1) {
        str = lines[i];
      } else {
        res.write(lines[i] + "\n\n");
      }
    }
  });

  spw.on('close', function (code) {
    console.log('close event');
    // clearInterval(keepAliveTimeout);
    res.write('ora2pg complete')
    res.end(str);
  });

  spw.stderr.on('data', function (data) {
    console.log('error event');
    // clearInterval(keepAliveTimeout);
    res.write('stderr: ' + data);
  });




});


module.exports = router;
