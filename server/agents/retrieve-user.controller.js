var Agent = require('./agent.model');
var User = require('../users/user.model');

module.exports = (options) => {
  return (req, res, next) => {
    Promise.all([
      Agent.findByToken(req.body.agentToken),
      User.findByAgentToken(req.body.userToken),
    ]).then(values => {
      if (values[0].agent._id !== values[1].agentId) {
        throw new Error(`Agent tokens mismatch.`);
      }
      return values[1];
    }).then(userInfo => res.json({ userId: userInfo.user._id }))
      .catch((err) => next(err));
  }
}
