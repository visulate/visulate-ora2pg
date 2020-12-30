var express = require('express');
var path = require('path');
var ora2pgRouter = require('./api/ora2pg');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'ui')));

app.use('/ora2pg', ora2pgRouter);
app.use('/vue', express.static(path.join(__dirname, 'node_modules/vue/dist')));

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
