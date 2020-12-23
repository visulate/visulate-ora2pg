const express = require('express');
const router = express.Router();
const fs = require('fs');
var path = require('path');
const appRoot = process.cwd();
const child_process = require('child_process');
const handlebars = require('handlebars');
const projectDirectory = `${appRoot}/project`;

const getConfigObject = function (project) {
  const config = fs.readFileSync(`${projectDirectory}/${project}/ora2pg-conf.json`)
  return JSON.parse(config);
}

const saveConfigJson = function (project, configObject) {
  const configStr = JSON.stringify(configObject);
  fs.writeFileSync(`${projectDirectory}/${project}/ora2pg-conf.json`, configStr);
}

const saveConfigFile = function (project, configObject) {
  const tpl = fs.readFileSync(`${appRoot}/views/ora2pg-config-file.hbs`, "utf8");
  const compiledTemplate = handlebars.compile(tpl);
  const configFile = compiledTemplate({ config: configObject });
  fs.writeFileSync(`${projectDirectory}/${project}/ora2pg.conf`, configFile);
}

const createProjectDirectory = function (project) {
  fs.mkdirSync(`${projectDirectory}/${project}`, { recursive: true }, (err) => {
    if (err && err.code != 'EEXIST') throw err;
    return;
  });
}

const listProjectDirectories = function () {
  return fs.readdirSync(`${projectDirectory}`)
  .filter(f => fs.statSync(path.join(`${projectDirectory}/`, f)).isDirectory());
}

const createConfigFile = (project) => {
  const config = getConfigObject(project);
  saveConfigFile(project, config);
}

const deleteConfigFile = (project) => {
  fs.unlink(`${projectDirectory}/${project}/ora2pg.conf`, (err) => {
    if (err) throw err;
  });
}

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/projects', (req, res) => {
  const projects = listProjectDirectories();
  res.json({projects: projects});
});

router.post('/', async (req, res) => {
  const formValues = req.body;
  const project = formValues['project'];
  createProjectDirectory(project);
  fs.copyFile(`${appRoot}/resources/ora2pg-conf.json`,
    `${appRoot}/project/${project}/ora2pg-conf.json`, (err) => {
      if (err) { console.log(err); }

    });

  res.status(201).send('Created');
});



router.get('/project/:project', function (req, res) {
  const project = req.params.project;
  const configJson = getConfigObject(project);
  res.json({config: configJson});
});



router.post('/:project', function (req, res) {
  const project = req.params.project;
  const configObject = req.body;
  saveConfigJson(project, configObject);
  res.status(201).send('Created');
});

router.get('/:project/exec', async function (req, res) {
  const project = req.params.project;
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-control": "no-cache",
    "Connection": "keep-alive"
  });
  res.connection.setTimeout(0);
  res.write("data:Creating config file\n\n");
  createConfigFile(project);

  res.write("data:Starting ora2pg\n\n");

  var ora2pg = child_process.spawn('ora2pg', ['-c', `${appRoot}/project/${project}/ora2pg.conf`], { cwd: `${appRoot}/project/${project}` });
  var str = "";

  ora2pg.stdout.on('data', function (data) {
    str += data.toString();
    //Flush str buffer
    var lines = str.split("\n");
    for (var i in lines) {
      if (i == lines.length - 1) {
        str = lines[i];
      } else {
        res.write("data:"+lines[i] + "\n\n");
      }
    }
  });

  ora2pg.on('close', function () {
    res.write('data:ora2pg complete\n\n');
    res.write("data:Removing config file\n\n");
    deleteConfigFile(project);

    console.log('ora2pg complete');
    res.end(str);
  });

  ora2pg.stderr.on('data', function (data) {
    res.write("data:"+data+"\n\n");
  });

});


module.exports = router;
