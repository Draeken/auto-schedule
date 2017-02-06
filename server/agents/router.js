var router = require('express').Router();

module.exports = (options) => {
  /**
   * body: { agentToken: token, userToken: token }
   */
  router.post('/retrieve-user', require('./retrieve-user.controller')());

  /**
   * body: { agent: { name: String, url: String, description: String } }
   */
  router.post('/register', require('./register.controller')());

  return router;
};
