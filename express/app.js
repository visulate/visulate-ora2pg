const express = require('express');
const path = require('path');
const ora2pgRouter = require('./api/ora2pg');
const cors = require('cors');
const httpServerConfig = require('./resources/http-config');

const app = express();

// Add support for cross origin requests
// if CORS_ORIGIN_WHITELIST environment variable is set
let corsOptions;
const whitelist = httpServerConfig.corsOriginWhitelist.replace(/\s/g, '').split(",");

if (whitelist.length === 1 && whitelist[0] === '*') {
  console.log(`Setting Access-Control-Allow-Origin to *`);
  corsOptions = { origin: '*' };
} else if  (whitelist.length > 0 && whitelist[0] !== '') {
  console.log(`Setting Access-Control-Allow-Origin to ${whitelist}`);
  corsOptions = {
    origin: function (origin, callback) {
      // allow whitelisted cross origin requests + REST tools and server to server
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true)
      } else {
        callback(new Error(`CORS error: origin server is not in ${whitelist}`))
      }
    }
  };
} else {
  console.log(`Setting Access-Control-Allow-Origin to FALSE`);
  corsOptions = { origin: false };
}
app.use(cors(corsOptions));


// Setup routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'ui')));

app.use('/ora2pg', ora2pgRouter);
app.use('/vue', express.static(path.join(__dirname, 'node_modules/vue/dist')));
app.use('/', express.static(path.join(__dirname, 'ui/dist')));
app.use('/projects/*', express.static(path.join(__dirname, 'ui/dist')));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
