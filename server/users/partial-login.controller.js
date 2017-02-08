var User = require('./user.model');
var helper = require('./helper');

module.exports = (options) => {
  return (req, res, next) => {
    let newUser = new User();
    newUser.devices.push(helper.createDevice(req));
    newUser.save()
      .then(helper.addTokenToDevice)
      .then(user => res.json({ token: user.devices[0].token }))
      .catch(next);
  };
}
