var jwt = require('jsonwebtoken');

var Agent = require('./agent.model');

function createAgent(body) {
  let agent = new Agent({
    name: body.agent.name,
    url: body.agent.url,
    description: body.agent.description,
  });
  return agent.save();
}

function generateToken(agent) {
  const payload = {
    agentId: agent._id
  };
  const token = jwt.sign(payload, require('./secret').token.server);
  agent.token = token;
  return agent.save().then(user => user.token);
}

module.exports = (options) => {
  return (req, res, next) => {
    createAgent(req.body)
      .then(agent => generateToken(agent))
      .then(token => res.json({ token: token }))
      .catch(next);
  }
}
