process.env.PROJECT_DIRECTORY = process.env.PWD + '/test/project';
process.env.TIMESTAMP_OVERRIDE = 123456789;

const app = require('../app');
const chai = require('chai'), chaiHttp = require('chai-http'), chaiFiles = require('chai-files');
chai.use(chaiHttp);
chai.use(chaiFiles);

const should = chai.should();
const expect = chai.expect;
const file = chaiFiles.file;
const dir = chaiFiles.dir;
const fs = require('fs');
const fileUtils = require('../api/file-utils');
const appConfig = require('../resources/http-config')

const testConfigObject = require('./project/default/config/ora2pg-conf.json');
const jose = require('jose');

describe("Create project tests", () => {

  before(async () => {
    const config = await fs.promises.readFile(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json`);
    await fileUtils.saveConfigJson('default', JSON.parse(config));
    const config2 = await fs.promises.readFile(`${process.env.PROJECT_DIRECTORY}/invalid_password/config/ora2pg-conf.json`);
    await fileUtils.saveConfigJson('invalid_password', JSON.parse(config2));

    await fs.promises.unlink(`${process.env.PROJECT_DIRECTORY}/default/default.tar.gz`);
  });

  after(async () => {
    // Verify undefined project directory was not created
    expect(dir(`${process.env.PROJECT_DIRECTORY}/undefined`)).to.not.exist;
    expect(dir(`${process.env.PROJECT_DIRECTORY}/config`)).to.not.exist;

    // Cleanup project directory
    await fs.promises.rmdir(`${process.env.PROJECT_DIRECTORY}/create_test_project`, { recursive: true });
  });

  it("POST empty project should fail", (done) => {
    chai.request(app)
      .post('/ora2pg')
      .send('')
      .end((err, res) => {
        expect(res).to.have.status(400);
        res.text.should.equal('Null project name');
        done();
      });
  });

  it("POST empty project name should fail", (done) => {
    chai.request(app)
      .post('/ora2pg')
      .send({ "project": "" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        res.text.should.equal('Null project name');
        done();
      });
  });

  it("POST invalid project name should fail", (done) => {
    chai.request(app)
      .post('/ora2pg')
      .send({ "project": "/" })
      .end((err, res) => {
        expect(res).to.have.status(400);
        res.text.should.equal('Project name must be alphanumeric');
        done();
      });
  });

  it("POST duplicate project name should fail", (done) => {
    chai.request(app)
      .post('/ora2pg')
      .send({ "project": "default" })
      .end((err, res) => {
        expect(res).to.have.status(409);
        res.text.should.equal('Project default already exists');
        done();
      });
  });

  it("POST valid project name should create a project", (done) => {
    chai.request(app)
      .post('/ora2pg')
      .send({ "project": "create_test_project" })
      .end((err, res) => {
        expect(res).to.have.status(201);
        res.text.should.equal('Created');
        expect(dir(`${process.env.PROJECT_DIRECTORY}/create_test_project`)).to.exist;
        expect(dir(`${process.env.PROJECT_DIRECTORY}/create_test_project/config`)).to.exist;
        expect(file(`${process.env.PROJECT_DIRECTORY}/create_test_project/config/ora2pg-conf.json.enc`)).to.exist;
        done();
      });
  });
});

describe("Retrieve projects tests", () => {
  it("GET /projects should get a list of project directories", (done) => {
    chai.request(app)
      .get('/ora2pg/projects')
      .end((err, res) => {
        res.should.have.status(200);
        // console.log(JSON.stringify(res.body, null, 2));
        res.body.should.be.a('object');
        res.body.projects.should.be.a('array');
        done();
      });
  });

  it("GET /project/empty (empty directory) should fail with 400 error", (done) => {
    chai.request(app)
      .get('/ora2pg/project/empty')
      .end((err, res) => {
        res.should.have.status(400);
        res.text.should.equal('Project directory is invalid')
        // console.log(res.text)
        done();
      });
  });

  it("GET /project/default should return empty project with default config", (done) => {
    chai.request(app)
      .get('/ora2pg/project/default')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.config.COMMON.title.should.equal("Include a common config file");
        res.body.config.COMMON.values.VISULATE_VERSION.value.should.equal(appConfig.configTemplateVersion);
        done();
      });
  });

  it("GET invalid (non-existent) project name should fail with 404", (done) => {
    chai.request(app)
      .get('/ora2pg/project/not-found')
      .end((err, res) => {
        res.should.have.status(404);
        res.text.should.equal('Not Found')
        done();
      });
  })
});

describe("Update and Delete project tests", () => {
  before(async () => {
    // Create a  project directory
    chai.request(app)
      .post('/ora2pg')
      .send({ "project": "update_test_project" })
      .end((err, res) => {
        expect(res).to.have.status(201);
        res.text.should.equal('Created');
        expect(dir(`${process.env.PROJECT_DIRECTORY}/update_test_project`)).to.exist;
        expect(dir(`${process.env.PROJECT_DIRECTORY}/update_test_project/config`)).to.exist;
        expect(file(`${process.env.PROJECT_DIRECTORY}/update_test_project/config/ora2pg-conf.json.enc`)).to.exist;
      });
  });

  after(async () => {
    expect(dir(`${process.env.PROJECT_DIRECTORY}/update_test_project`)).to.not.exist;

    // Cleanup generated file
    fs.unlinkSync(`${process.env.PROJECT_DIRECTORY}/default/package.sql`);
    expect(file(`${process.env.PROJECT_DIRECTORY}/default/package.sql`)).to.not.exist;
  });

  it("Successful execution generates file output and removes temporary config file", (done) => {
    // default project config converts a package body file
    chai.request(app)
      .get('/ora2pg/project/default/exec')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.headers.connection.should.equal('keep-alive');
        res.headers['content-type'].should.equal('text/event-stream; charset=utf-8');
        res.headers['cache-control'].should.equal('no-cache');
        res.headers['transfer-encoding'].should.equal('chunked');
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/package.sql`)).to.exist;
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/default.tar.gz`)).to.exist;
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg.conf`)).to.not.exist;
        done();
      });
  });

  it("Compressed tar file should not be created if directory is empty", (done) => {
    // default project config converts a package body file
    chai.request(app)
      .get('/ora2pg/project/invalid_password/exec')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.headers.connection.should.equal('keep-alive');
        res.headers['content-type'].should.equal('text/event-stream; charset=utf-8');
        res.headers['cache-control'].should.equal('no-cache');
        res.headers['transfer-encoding'].should.equal('chunked');
        expect(file(`${process.env.PROJECT_DIRECTORY}/invalid_password/invalid_password.tar.gz`)).to.not.exist;
        done();
      });
  });

  it("Execute should not start if ora2pg is already running", (done) => {
    fs.writeFileSync(`${process.env.PROJECT_DIRECTORY}/update_test_project/config/ora2pg.conf`, 'dummy file');
    chai.request(app)
      .get('/ora2pg/project/update_test_project/exec')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.headers.connection.should.equal('keep-alive');
        res.headers['content-type'].should.equal('text/event-stream; charset=utf-8');
        res.headers['cache-control'].should.equal('no-cache');
        res.headers['transfer-encoding'].should.equal('chunked');
        res.headers['warning'].should.equal('199 - ora2pg is running');
        done();
      });
  });

  it("Executing empty project fails with 404", (done) => {
    chai.request(app)
      .get('/ora2pg/project/empty/exec')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("Executing project with no configuration file fails with 404", (done) => {
    chai.request(app)
      .get('/ora2pg/project/missing_config_file/exec')
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("POST non JSON file should fail with 400", (done) => {
    chai.request(app)
      .post('/ora2pg/project/update_test_project')
      .send('adrfafdadf ddddd')
      .end((err, res) => {
        expect(res).to.have.status(400);
        res.text.should.equal('Invalid configuration object');
        done();
      });
  });

  it("POST valid JSON file return 201", (done) =>  {
    chai.request(app)
      .post('/ora2pg/project/update_test_project')
      .send(testConfigObject)
      .end((err, res) => {
        expect(res).to.have.status(201);
        done();
      });
  });

  it("POST stale JSON file return 409", (done) =>  {
    testConfigObject.COMMON.values.LAST_MODIFIED.value = 0;
    chai.request(app)
      .post('/ora2pg/project/update_test_project')
      .send(testConfigObject)
      .end((err, res) => {
        expect(res).to.have.status(409);
        done();
      });
  });

  it("Download invalid (missing) file should fail with 404", (done) => {
    chai.request(app)
      .get('/ora2pg/project/update_test_project/download/missing.file')
      .end((err, res) => {
        expect(res).to.have.status(404);
        res.text.should.equal('File not found');
        done();
      });
  });

  it("Download valid file should work", (done) => {
    fs.writeFileSync(`${process.env.PROJECT_DIRECTORY}/update_test_project/dummy.sql`, 'dummy file');
    chai.request(app)
      .get('/ora2pg/project/update_test_project/download/dummy.sql')
      .end((err, res) => {
        expect(res).to.have.status(200);
        res.headers['content-disposition'].should.equal('attachment; filename="dummy.sql"');
        done();
      });
  });

  it("Delete invalid project should fail with 404", (done) => {
    chai.request(app)
    .delete('/ora2pg/project/invalid_project')
    .end((err, res) => {
      expect(res).to.have.status(404);
      res.text.should.equal('Project not found');
      done();
    });
  });

  it("Delete valid project should succeed", (done) => {
    chai.request(app)
    .delete('/ora2pg/project/update_test_project')
    .end((err, res) => {
      expect(res).to.have.status(204);
      expect(dir(`${process.env.PROJECT_DIRECTORY}/update_test_project`)).to.not.exist;
      expect(dir(`${process.env.PROJECT_DIRECTORY}/update_test_project/config`)).to.not.exist;
      expect(file(`${process.env.PROJECT_DIRECTORY}/update_test_project/config/ora2pg-conf.json.enc`)).to.not.exist;

      done();
    });
  });

  it("Save project that does not exist should fail with 404", (done) => {
    chai.request(app)
    .post('/ora2pg/project/fake_project')
    .send(testConfigObject)
    .end((err, res) => {
      expect(res).to.have.status(404);
      done();
    })
  })
});

describe("Credentials tests", () => {
  it('Send credentials', (done) => {
    const body = {
      "ORACLE_USER": "system",
      "ORACLE_PWD": "myPass123",
      "PG_USER": "pgusername",
      "PG_PWD": "password1234"
    };
    chai.request(app)
    .post('/ora2pg/project/credential_test_project/credentials')
    .send(body)
    .end(async (err, res) => {
      expect(res).to.have.status(200);
      const {payload} = await jose.jwtVerify(res.text, appConfig.authKeyBuffer);
      payload.ORACLE_USER.should.equal(body.ORACLE_USER);
      payload.ORACLE_PWD.should.equal(body.ORACLE_PWD);
      payload.PG_USER.should.equal(body.PG_USER);
      payload.PG_PWD.should.equal(body.PG_PWD);
      done();
    });
  });
});

describe("Export tests", () => {
  it('Download config file', (done) => {
    chai.request(app)
    .get('/ora2pg/project/default/export')
    .end((err, res) => {
      expect(res).to.have.status(200);
      res.headers['content-disposition'].should.equal('attachment; filename="ora2pg.conf"');
      expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg.conf`)).not.to.exist;
      done();
    });
  });
});

describe("Delete config tests", () => {
  it("Delete config file - success", async () => {
    // GIVEN
    const config = await fs.promises.readFile(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json`);
    await fileUtils.saveConfigFile('default', config);

    // WHEN
    chai.request(app)
    .delete('/ora2pg/project/default/config')
    .end((err, res) => {
      // THEN
      expect(res).to.have.status(204);
      expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg.conf`)).not.to.exist;
    });
  });

  it("Delete config file - config file doesn't exist", async () => {
    // WHEN
    chai.request(app)
    .delete('/ora2pg/project/default/config')
    .end((err, res) => {
      // THEN
      expect(res).to.have.status(409);
    });
  });

  it("Delete config file - project doesn't exist", async () => {
    // WHEN
    chai.request(app)
    .delete('/ora2pg/project/invalid_project_name/config')
    .end((err, res) => {
      // THEN
      expect(res).to.have.status(404);
    });
  });
});
