var mongoose = require('mongoose');
var User = require('./user.model');
var Agent = require('../agents/agent.model');

function updateAgents(userInfo, agentNames) {
  let user = userInfo.user;
  return Promose.all([
    Agent.findByNames(agentNames.added, '_id'),
    Agent.findByNames(agentNames.removed, '_id')])
    .then(agentIds => {
      agentIds[1].forEach(agentId => user.agents.pull(agentId));
      agentIds[0].forEach(agentId => user.agents.push(agentId));
    }).then(agentIds => {
      return user.save().then(user => generateAgentTokens(userInfo, agentIds[0]));
    });
}

function generateAgentTokens(userInfo, addedAgentIds) {
  const agentIds = addedAgentIds;
  const userId = userInfo.user._id;
  const deviceId = userInfo.device._id;
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
      .then(userInfo => updateAgents(userInfo, req.body.agentNames))
      .then(tokens => res.json({ tokens: tokens }))
      .catch(next);
  }
}
