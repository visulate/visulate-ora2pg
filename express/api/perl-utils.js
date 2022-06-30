const exec = require('child_process').exec;

function testConnection(dsn, username, password) {
    return new Promise(resolve => {
        exec(`perl express/db_connection_check.pl "${dsn}" "${username}" "${password}"`, (err, stdout) => {
            resolve(stdout);
          });
    });
}
module.exports.testConnection = testConnection;