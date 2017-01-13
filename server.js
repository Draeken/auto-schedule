var express = require('express');
var app = express();

app.get('/', (req, res) => {
  var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
  res.send('hello world ' + ip)
});

app.listen(3000, () => console.log('App listening on port 3000'));
