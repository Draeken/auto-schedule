var router = require('express').Router();
var useragent = require('express-useragent');

module.exports = (options) => {
  router.get('/partial-login', useragent.express(), require('./partial-login')());

  return router;
};
