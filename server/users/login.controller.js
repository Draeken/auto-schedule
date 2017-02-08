var jwt = require('jsonwebtoken');

var User = require('./user.model');
var helper = require('./helper');

module.exports = (options) => {
  return (req, res, next) => {
    Promise.all([
      User.findByDeviceToken(req.body.anoToken),
      User.findByLogin(req.body.email, req.body.password)
    ]).then(User.mergeUsers)
      .catch(e => {
        if (e.e === "NoNewUser") {
          e.user.devices.push(helper.createDevice(req));
          return e.user.save().then(helper.addTokenToDevice);
        } else {
          throw e;
        }
      })
      .then(user => res.json({ token: user.devices[user.devices.length - 1].token }))
      .catch(next);
  };
}
