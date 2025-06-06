const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader); // Log the header
  if (!authHeader) {
    console.warn('No Authorization header received');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('No token found in Authorization header:', authHeader);
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded JWT user:', decoded); // Log the decoded user
    req.user = decoded;
    next();
  } catch (err) {
    console.warn('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};