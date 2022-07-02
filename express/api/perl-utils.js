const exec = require('child_process').exec;

function testConnection(dsn, username, password) {
    let cwd = process.env.PWD;
    if (cwd.indexOf('/express') === -1) {
        cwd = cwd + '/express'
    }
    return new Promise(resolve => {
        exec(`perl db_connection_check.pl "${dsn}" "${username}" "${password}"`, {cwd},
          (err, stdout) => {
            resolve(stdout);
          });
    });
}
module.exports.testConnection = testConnection;