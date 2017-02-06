var router = require('express').Router();
var useragent = require('express-useragent');

module.exports = (options) => {
  router.get('/partial-login', useragent.express(), require('./partial-login.controller')());
  router.post('/update-user', require('./update-user.controller')());
  router.post('/login', useragent.express(), require('./login.controller')());
  router.post('/update-agents', require('./update-agents.controller')());

  return router;
};
