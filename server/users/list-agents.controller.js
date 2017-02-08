var Agent = require('../agents/agent.model');

module.exports = (options) => {
  return (req, res, next) => {
    Agent.find().exec()
      .then(agents => res.json(agents))
      .catch(next);
  }
}
