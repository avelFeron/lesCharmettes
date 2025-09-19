const path = require('path');

const PORT = process.env.PORT || 3000;
const SITE_NAME = process.env.SITE_NAME || 'Les Charmettes';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || process.env.MAILER_TO || 'contact@lescharmettes.fr';
const DATA_DIR = path.join(__dirname, 'data');
const ADMIN_USER = process.env.ADMIN_USER || process.env.BASIC_AUTH_USER || null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.BASIC_AUTH_PASSWORD || null;

module.exports = {
  PORT,
  SITE_NAME,
  CONTACT_EMAIL,
  DATA_DIR,
  ADMIN_USER,
  ADMIN_PASSWORD
};
