var router = require('express').Router();
var bodyParser = require('body-parser');

module.exports = (options) => {

  /**
   * body: { agentId: id, status: enum }
   */
  router.put('/update-agent-status', bodyParser.json(), require('./update-agent-status.controller')());

  return router;
};
