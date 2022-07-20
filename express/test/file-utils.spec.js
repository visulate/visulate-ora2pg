process.env.PROJECT_DIRECTORY = process.env.PWD + '/test/project';

const chai = require('chai'), chaiFiles = require('chai-files');
const expect = chai.expect;
const file = chaiFiles.file;
const fs = require('fs');
const { version } = require('os');

const fileUtils = require('../api/file-utils');
const appConfig = require('../resources/http-config');

describe("File Utils tests", () => {
    it("Test handleDefaultConfigVersionUpdate - same version", async () => {
        // GIVEN
        const configObject = {
            COMMON: {
                values: {
                    VISULATE_VERSION: {
                        value: appConfig.configTemplateVersion
                    }
                }
            }
        }

        // WHEN
        const test = await fileUtils.handleDefaultConfigVersionUpdate('default', configObject);

        // THEN
        test.should.equal(configObject);
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc`)).to.exist;
    });

    it("Test handleDefaultConfigVersionUpdate - should reject when config (major) version is newer", async () => {
        // GIVEN
        const versionArr = appConfig.configTemplateVersion.split('.')
        // Parse the first digit of the template version as an int
        const majorVersionNumber = ~~versionArr[0];
        const configObject = {
            COMMON: {
                values: {
                    VISULATE_VERSION: {
                        // Bump up the major version number by one
                        value: (majorVersionNumber + 1) + '.' + versionArr.slice(1, versionArr.length).join('.')
                    }
                }
            }
        };

        // WHEN
        const test = await fileUtils.handleDefaultConfigVersionUpdate('default', configObject);

        // THEN
        expect(test).to.equal(null);
    });

    it("Test handleDefaultConfigVersionUpdate - should reject when config (minor) version is newer", async () => {
        // GIVEN
        const versionArr = appConfig.configTemplateVersion.split('.')
        // Parse the last digit of the template version as an int
        const minorVersionNumber = ~~versionArr[versionArr.length - 1];
        const configObject = {
            COMMON: {
                values: {
                    VISULATE_VERSION: {
                        // Bump up the minor version number by one
                        value: versionArr.slice(0, versionArr.length - 1) + '.' + (minorVersionNumber + 1)
                    }
                }
            }
        };

        // WHEN
        const test = await fileUtils.handleDefaultConfigVersionUpdate('default', configObject);

        // THEN
        expect(test).to.equal(null);
    });

    it("Test handleDefaultConfigVersionUpdate - no version on config", async () => {
        // GIVEN
        const configObject = {
            COMMON: {
                values: {}
            },
            INPUT: {
                values: {
                    ORACLE_DSN: {
                        value: 'custom-value'
                    }
                }
            }
        }

        // WHEN
        const test = await fileUtils.handleDefaultConfigVersionUpdate('default', configObject);

        // THEN
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc`)).to.exist;
        const configEnc = await fs.promises.readFile(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc`);
        const configStr = fileUtils.decrypt(configEnc);
        const config = JSON.parse(configStr);
        config.INPUT.values.ORACLE_USER.value.should.equal('system');
        config.INPUT.values.ORACLE_DSN.value.should.equal('custom-value');
        config.COMMON.values.VISULATE_VERSION.value.should.equal(appConfig.configTemplateVersion);
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc.old`)).to.exist;
    });

    it("Test handleDefaultConfigVersionUpdate - update (major) version", async () => {
        // GIVEN
        const versionArr = appConfig.configTemplateVersion.split('.')
        // Parse the first digit of the template version as an int
        const majorVersionNumber = ~~versionArr[0];
        const configObject = {
            COMMON: {
                values: {
                    VISULATE_VERSION: {
                        // Decrement the major version number by one
                        value: (majorVersionNumber - 1) + '.' + versionArr.slice(1, versionArr.length).join('.')
                    }
                }
            },
            INPUT: {
                values: {
                    ORACLE_DSN: {
                        value: 'custom-value'
                    }
                }
            }
        };

        // WHEN
        const test = await fileUtils.handleDefaultConfigVersionUpdate('default', configObject);

        // THEN
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc`)).to.exist;
        const configEnc = await fs.promises.readFile(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc`);
        const configStr = fileUtils.decrypt(configEnc);
        const config = JSON.parse(configStr);
        config.INPUT.values.ORACLE_USER.value.should.equal('system');
        config.INPUT.values.ORACLE_DSN.value.should.equal('custom-value');
        config.COMMON.values.VISULATE_VERSION.value.should.equal(appConfig.configTemplateVersion);
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc.old`)).to.exist;
    });

    it("Test handleDefaultConfigVersionUpdate - update (minor) version", async () => {
        // GIVEN
        const versionArr = appConfig.configTemplateVersion.split('.')
        // Parse the first digit of the template version as an int
        const minorVersionNumber = ~~versionArr[versionArr.length - 1];
        const configObject = {
            COMMON: {
                values: {
                    VISULATE_VERSION: {
                        // Decrement the minor version number by one
                        value: versionArr.slice(0, versionArr.length - 1) + '.' + (minorVersionNumber - 1)
                    }
                }
            },
            INPUT: {
                values: {
                    ORACLE_DSN: {
                        value: 'custom-value'
                    }
                }
            }
        };

        // WHEN
        const test = await fileUtils.handleDefaultConfigVersionUpdate('default', configObject);

        // THEN
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc`)).to.exist;
        const configEnc = await fs.promises.readFile(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc`);
        const configStr = fileUtils.decrypt(configEnc);
        const config = JSON.parse(configStr);
        config.INPUT.values.ORACLE_USER.value.should.equal('system');
        config.INPUT.values.ORACLE_DSN.value.should.equal('custom-value');
        config.COMMON.values.VISULATE_VERSION.value.should.equal(appConfig.configTemplateVersion);
        expect(file(`${process.env.PROJECT_DIRECTORY}/default/config/ora2pg-conf.json.enc.old`)).to.exist;
    });
});