var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var sodium = require('sodium').api;
var deviceSchema = require('./device.schema');

var userSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  pwhash: { type: Buffer, default: Buffer.alloc(0) },
  devices: { type: [deviceSchema], default: [] },
  agents: [{ type: Schema.Types.ObjectId, ref: 'Agent' }],
});

function checkUserAndDevice(userId, deviceId) {
  return this.findById(userId).exec().then(user => {
    if (!user) { throw new Error(`User ${userId} not found.`);}
    let device = user.devices.id(deviceId);
    if (!device) { throw new Error(`Device ${deviceId} not found on user ${userId}`); }
    return {
      user: user,
      device: device,
    };
  });
}

userSchema.statics.findByDeviceToken = function(token) {
  let payload = jwt.verify(token, require('./secret').token.client);
  return checkUserAndDevice.call(this, payload.userId, payload.deviceId);
}

userSchema.statics.findByAgentToken = function(token) {
  let payload = jwt.verify(token, require('./secret').token.agents);
  return checkUserAndDevice.call(this, payload.userId, payload.deviceId)
    .then(userInfo => {
      if (!userInfo.user.agents.toObject().some(agentId => agentId.toString() === payload.agentId)) {
        throw new Error(`Agent ${payload.agentId} nout found on user ${payload.userId}`);
      }
      return {
        user: userInfo.user,
        device: userInfo.device,
        agentId: mongoose.Types.ObjectId(payload.agentId),
      };
    });
}

userSchema.statics.findByLogin = function(email, password) {
  return User.findOne({ 'email': email }).exec()
    .then(user => {
      if (!user) { throw new Error(`Users with email ${email} not found`);}
      if (!sodium.crypto_pwhash_str_verify(user.pwhash, Buffer.from(password, 'utf8'))) {
        throw new Error(`Password mismatch for user ${email}`);
      }
      return user;
    })
}

module.exports = mongoose.model('User', userSchema);
