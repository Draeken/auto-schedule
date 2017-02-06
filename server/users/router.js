var router = require('express').Router();
var useragent = require('express-useragent');

module.exports = (options) => {
  router.post('/partial-login', useragent.express(), require('./partial-login.controller')());
  router.post('/update-user', require('./update-user.controller')());
  router.post('/login', useragent.express(), require('./login.controller')());
  router.post('/update-agents', require('./update-agents.controller')());
  router.get('/list-agents', require('./list-agents.controller')());
  return router;
};
