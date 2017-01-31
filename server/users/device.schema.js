var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  token: { type: String, default: '' },
  ips: { type: [String], default: [] },
  name: { type: String, default: '' },
  userAgent: { type: String, default: '' },
});
