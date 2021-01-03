/**
 * Return environment variable or default value
 */
module.exports = {
    port: process.env.HTTP_PORT || 3000 ,
    projectDirectory: process.env.PROJECT_DIRECTORY||process.env.PWD + '/project',
    resourceDirectory: process.env.RESOURCE_DIRECTORY||process.env.PWD + '/resources'
  };