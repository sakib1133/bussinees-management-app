const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ['HS256']
});

if (!decoded || typeof decoded.userId !== 'number') {
  return res.status(401).json({
    success: false,
    message: 'Token is invalid.'
  });
}

req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired.'
    });
  }
};

module.exports = auth;
