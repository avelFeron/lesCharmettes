const { ADMIN_USER, ADMIN_PASSWORD } = require('../config');

function sendUnauthorized(res) {
  res.set('WWW-Authenticate', 'Basic realm="Tarifs", charset="UTF-8"');
  return res.status(401).send('Authentification requise');
}

module.exports = function basicAuth(req, res, next) {
  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    console.error('Admin credentials are not configured');
    return res.status(500).send('Configuration admin incomplete');
  }

  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Basic ')) {
    return sendUnauthorized(res);
  }

  const base64Credentials = authorization.slice(6);
  let decoded = '';
  try {
    decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
  } catch (error) {
    return sendUnauthorized(res);
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) {
    return sendUnauthorized(res);
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
    return sendUnauthorized(res);
  }

  return next();
};
