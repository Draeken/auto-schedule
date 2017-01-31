var express = require('express');
var app = express();
var morgan = require('morgan');

app.disable('trust proxy');
app.use(morgan('combined'));

// var bodyParser = require('body-parser');
//
// app.use(bodyParser.json());

module.exports = (options) => {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", `${options.test.server.ip}:${options.test.server.port}`);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.use('/user', require('./users/router.js')());

  app.use((req, res) => res.sendStatus(404));

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err)
    }
    console.error(err.stack);
    res.sendStatus(500);
  });
  return app;
}
