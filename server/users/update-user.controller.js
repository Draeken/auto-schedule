var mongoose = require('mongoose');
var sodium = require('sodium').api;
var User = require('./user.model');

function checkPassword(pwhash, oldPw) {
  if (pwhash.length > 0) {
    if (!sodium.crypto_pwhash_str_verify(pwhash, Buffer.from(oldPassword, 'utf8'))) {
      throw new Error(`Old password mismatch.`);
    }
  }
}

function updateEmail(user, email) {
  const oldEmail = user.email;
  if (email === oldEmail) { return new Promise.resolve() }
  if (!email) { throw new Error(`Email cannot be empty`) };
  return User.findOne({ 'email': email }).exec()
    .then(conflictUser => {
      if (conflictUser) { throw new Error(`Email already used`) }
    })
    .then(() => {
      user.email = email;
      return user.save();
    });
}

function updatePassword(user, password, oldPassword) {
  if (password.length === 0 ||
      password === oldPassword) { return user; }
  user.pwhash = sodium.crypto_pwhash_str(
    Buffer.from(password, 'utf8'),
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
  );
  return user;
}

function updateUser(userInfo, userUpdated) {
  let user = userInfo.user;
  checkPassword(user.pwhash, userUpdated.oldPassword);
  return updateEmail(user, userUpdated.email)
    .then(() => updatePassword(user, userUpdated.password, userUpdated.oldPassword))
    .then(user => user.save());
}

module.exports = (options) => {
  return (req, res, next) => {
    User.findByDeviceToken(req.body.token)
      .then(userInfo => updateUser(userInfo, req.body.userInfo))
      .then(() => res.sendStatus(200))
      .catch(next);
  }
}
