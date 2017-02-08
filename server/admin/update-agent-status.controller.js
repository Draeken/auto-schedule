var mongoose = require('mongoose');

var Agent = require('../agents/agent.model');

function updateStatus(agentId, status) {
  if (!agentId || !status) { throw new Error(`Invalid parameters ${agentId}, ${status}.`); }
  return Agent.findById(mongoose.Types.ObjectId(agentId)).exec()
    .then(agent => {
      if (!agent) { throw new Error(`Agent ${agentId} not found.`); }
      agent.status = status;
      return agent.save();
    });
}

module.exports = (options) => {
  return (req, res, next) => {
    updateStatus(req.body.agentId, req.body.status)
      .then(agent => res.json(agent))
      .catch(next);
  }
}
