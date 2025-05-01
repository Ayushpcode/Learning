const jwt = require('jsonwebtoken');

exports.generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWTCODE, {
    expiresIn: '7d',
  });

  return token;
};
