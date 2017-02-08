var jwt = require('jsonwebtoken');

var User = require('./user.model');

module.exports = (options) => {
  return (req, res, next) => {
    Promise.all([
      User.findByDeviceToken(req.body.token),
      User.findByLogin(req.body.userInfo.email, req.body.userInfo.password, false)
    ]).then(User.mergeUsers)
      .then(user => res.json({ token: user.devices[user.devices.length - 1].token }))
      .catch(e => {
        if ( e.e === "NoLegacyUser") {
          require('./update-user.controller')()(req, res, next)
        } else {
          next(e);
        }
      });
  };
}
