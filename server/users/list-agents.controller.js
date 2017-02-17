var Agent = require('../agents/agent.model');

module.exports = (options) => {
  return (req, res, next) => {
    Agent.find().select('-_id url description name').exec()
      .then(agents => res.json(agents))
      .catch(next);
  }
}
