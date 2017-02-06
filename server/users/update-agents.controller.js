var mongoose = require('mongoose');
var User = require('./user.model');
var Agent = require('../agents/agent.model');

function verifyAgents(agentIds) {
  return Agent.find({
    '_id': { $in: agentIds }
  }).then(docs => {
    if (docs.length !== agentIds.length) {
      throw new Error(`One agent id is unregistered`);
    }
  });
}

function updateAgents(userInfo, agentIds) {
  let user = userInfo.user;
  let addedAgentIds = agentIds.added.map(agentId => mongoose.Types.ObjectId(agentId));
  let removedAgentIds = agentIds.removed.map(agentId => mongoose.Types.ObjectId(agentId));
  return verifyAgents(addedAgentIds)
    .then(() => {
      removedAgentIds.forEach(agentId => user.agents.pull(agentId));
      addedAgentIds.forEach(agentId => user.agents.push(agentId));
      return user.save();
    })
    .then(() => {
      return {
        userInfo: userInfo,
        addedAgentIds: addedAgentIds
      };
    });
}

function generateAgentTokens(userAndAgent) {
  const agentIds = userAndAgent.addedAgentIds;
  const userId = userAndAgent.userInfo.user._id;
  const deviceId = userAndAgent.userInfo.device._id;
  let tokens = [];

  agents.forEach(agentId => {
    const payload = {
      userId: userId,
      deviceId: deviceId,
      agentId: agentId,
    };
    const token = jwt.sign(payload, require('./secret').token.agents);
    tokens.push(token);
  });
  return tokens;
}

module.exports = (options) => {
  return (req, res, next) => {
    User.findByDeviceToken(req.body.token)
      .then(userInfo => updateAgents(userInfo, req.body.agentIds))
      .then(userAndAgent => generateAgentTokens(userAndAgent))
      .then(tokens => res.json({ tokens: tokens }))
      .catch((err) => next(err));
  }
}
