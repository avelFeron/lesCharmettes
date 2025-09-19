require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const expressLayouts = require('express-ejs-layouts');

const { PORT, SITE_NAME, CONTACT_EMAIL } = require('./config');
const siteRoutes = require('./routes/siteRoutes');
const apiRoutes = require('./routes/apiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  etag: true
}));

app.locals.siteName = SITE_NAME;
app.locals.contactEmail = CONTACT_EMAIL;
app.locals.navigation = [
  { label: 'Accueil', href: '/' },
  { label: 'Pr\u00e9sentation', href: '/presentation' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Notre \u00e9quipe', href: '/equipe' },
  { label: 'Contact', href: '/contact' }
];

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use('/', siteRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  if (req.accepts('json')) {
    return res.status(404).json({ error: 'Ressource introuvable' });
  }

  return res.status(404).send('Page introuvable');
});

app.use((err, req, res, next) => {
  console.error(err);
  if (req.accepts('json')) {
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }

  return res.status(500).send('Une erreur est survenue : veuillez r\u00e9essayer plus tard.');
});

app.listen(PORT, () => {
  console.log(`Les Charmettes est disponible sur http://localhost:${PORT}`);
});


