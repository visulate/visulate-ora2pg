const fileUtils = require('../api/file-utils');
const appConfig = require('../resources/http-config');

describe("File Utils tests", () => {
    it("Test handleConfigVersionUpdate - same version", async () => {
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
    });
});