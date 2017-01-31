var mongoose = require('mongoose');
var deviceSchema = require('./device.schema');

var userSchema = new mongoose.Schema({
  email: { type: String, default: '' },
  pwhash: { type: String, default: '' },
  devices: { type: [deviceSchema], default: [] },
});

module.exports = mongoose.model('Users', userSchema);
