var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var User = require('./user.model');
var Agent = require('../agents/agent.model');

function updateAgents(userInfo, agentNames) {
  let user = userInfo.user;
  return Promise.all([
    Agent.findByNames(agentNames.added, '_id name url'),
    Agent.findByNames(agentNames.removed, '_id')])
    .then(agents => {
      agents[1].forEach(agent => user.agents.pull(agent._id));
      agents[0].forEach(agent => user.agents.push(agent._id));
      return agents;
    }).then(agents => {
      return user.save().then(user => generateAgentTokens(userInfo, agents[0]));
    });
}

function generateAgentTokens(userInfo, addedAgent) {
  const agents = addedAgent;
  const userId = userInfo.user._id;
  const deviceId = userInfo.device._id;
  let tokens = [];

  agents.forEach(agent => {
    const payload = {
      userId: userId,
      deviceId: deviceId,
      agentId: agent._id,
    };
    const token = jwt.sign(payload, require('./secret').token.agents);
    tokens.push({
      agent: {
        name: agent.name,
        url: agent.url
      },
      token: token });
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
