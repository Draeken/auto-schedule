var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');

app.disable('trust proxy');
app.use(morgan('combined'));

module.exports = (options) => {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", `${options.test.server.ip}${options.test.server.port}`);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.post('*', bodyParser.json());

  app.use('/user', require('./users/router.js')());
  app.use('/agent', require('./agents/router.js')());
  app.use('/admin', require('./admin/router.js')());

  app.use(express.static(path.join(__dirname, '../dist')));
  app.all('/*', (req, res) => res.sendFile('index.html', { root: 'dist' }));

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err)
    }
    console.error(err.stack);
    res.sendStatus(500);
  });

  return app;
}
