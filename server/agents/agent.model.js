var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var agentSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  url: { type: String, default: '' },
  token: { type: String, default: '' },
  status: { type: String, enum: ['New', 'Verified', 'Disabled'], default: 'New' },
});

agentSchema.statics.findByToken = function(token) {
  let payload = jwt.verify(token, require('./secret').token.server);
  return this.findById(payload.agentId).exec().then(agent => {
    if (!agent) { throw new Error(`Agent ${payload.agentId} not found.`); }
    if (agent.token !== token) { throw new Error(`Invalid token for agent ${agent._id}`); }
    return agent;
  });
}

agentSchema.statics.findByNames = function(names, select) {
  return this
    .find({
      name: { $in: names }
    })
    .select(select)
    .exec();
}

module.exports = mongoose.model('Agent', agentSchema);
