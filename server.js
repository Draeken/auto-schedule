var config = require('./server/config');
var mongoose = require('mongoose');

mongoose.connect(`mongodb://${config.db.ip}/${config.db.name}`);
mongoose.Promise = global.Promise;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() {
  console.log(`connected to DB ${config.db.ip}/${config.db.name}`);
});

var app = require('./server/index')({
  test: config.test,
});

app.listen(config.express.port, config.express.ip, function (error) {
  if (error) {
    console.error('Unable to listen for connections', error);
    process.exit(10);
  }
  console.info(`express is listening on http://${config.express.ip}:${config.express.port}`);
})
