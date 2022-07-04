const exec = require('child_process').exec;

function testConnection(dsn, username, password) {
    let cwd = process.env.PWD;
    if (cwd.indexOf('/express') === -1) {
        cwd = cwd + '/express'
    }
    return new Promise(resolve => {
        exec(`perl db_connection_check.pl "${dsn}" "${username}" "${password}"`, {cwd},
          (err, stdout) => {
            if (err) {
                let errorMessage = err.message.replace('perl db_connection_check.pl ', '');
                errorMessage = errorMessage.replace(new RegExp(password, 'g'), "*****");
                const errMessageStartIdx = errorMessage.lastIndexOf('failed: ') + 'failed: '.length;
                resolve(errorMessage.substring(errMessageStartIdx, errMessageStartIdx + 80) + '...')
            } else {
                resolve(stdout);
            }
          });
    });
}
module.exports.testConnection = testConnection;