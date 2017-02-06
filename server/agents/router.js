var router = require('express').Router();

module.exports = (options) => {
  router.post('/retrieve-user', require('./retrieve-user.controller')());
  router.post('/register', require('./register.controller')());

  return router;
};
