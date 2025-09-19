require('dotenv').config();

const path = require('path');
const fs = require('fs/promises');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const expressLayouts = require('express-ejs-layouts');
const mailer = require('./lib/mailer');

const app = express();

const PORT = process.env.PORT || 3000;
const SITE_NAME = process.env.SITE_NAME || 'Les Charmettes';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || process.env.MAILER_TO || 'contact@lescharmettes.fr';
const DATA_DIR = path.join(__dirname, 'data');

const dataCache = new Map();

async function readJson(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  const cached = dataCache.get(filePath);
  if (cached) {
    const { mtimeMs, data } = cached;
    try {
      const { mtimeMs: currentMtime } = await fs.stat(filePath);
      if (currentMtime === mtimeMs) {
        return data;
      }
    } catch (error) {
      dataCache.delete(filePath);
      throw error;
    }
  }

  const [fileContent, stats] = await Promise.all([
    fs.readFile(filePath, 'utf8'),
    fs.stat(filePath)
  ]);

  const json = JSON.parse(fileContent);
  dataCache.set(filePath, { mtimeMs: stats.mtimeMs, data: json });
  return json;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

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
  { label: 'Présentation', href: '/presentation' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Équipe', href: '/equipe' },
  { label: 'Contact', href: '/contact' }
];

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.get('/', asyncHandler(async (req, res) => {
  const [tarifs, articles, equipe] = await Promise.all([
    readJson('tarifs.json'),
    readJson('articles.json'),
    readJson('equipe.json')
  ]);

  res.render('index', {
    pageTitle: 'Accueil',
    heroImages: ['header1.svg', 'header2.svg', 'header3.svg'],
    highlightTarifs: tarifs.slice(0, 3),
    latestArticles: articles.slice(0, 3),
    equipe
  });
}));

app.get('/presentation', asyncHandler(async (req, res) => {
  const equipe = await readJson('equipe.json');
  res.render('presentation', {
    pageTitle: 'La Maison',
    equipe
  });
}));

app.get('/tarifs', asyncHandler(async (req, res) => {
  const tarifs = await readJson('tarifs.json');
  res.render('tarifs', {
    pageTitle: 'Nos Tarifs',
    tarifs
  });
}));

app.get('/equipe', asyncHandler(async (req, res) => {
  const equipe = await readJson('equipe.json');
  res.render('equipe', {
    pageTitle: 'Notre Équipe',
    equipe
  });
}));

app.get('/articles/:slug', asyncHandler(async (req, res) => {
  const articles = await readJson('articles.json');
  const article = articles.find((item) => item.slug === req.params.slug);

  if (!article) {
    return res.status(404).render('article', {
      pageTitle: 'Article introuvable',
      article: null
    });
  }

  return res.render('article', {
    pageTitle: article.title,
    article
  });
}));

app.get('/contact', (req, res) => {
  res.render('contact', {
    pageTitle: 'Contact'
  });
});

app.post('/contact', asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    const errorMessage = 'Veuillez renseigner au minimum votre nom, votre email et votre message.';
    if (req.accepts('json')) {
      return res.status(400).json({ error: errorMessage });
    }

    return res.status(400).render('contact', {
      pageTitle: 'Contact',
      formData: { name, email, phone, message },
      error: errorMessage
    });
  }

  await mailer.sendContactMessage({
    name,
    email,
    phone,
    message,
    to: CONTACT_EMAIL
  });

  if (req.accepts('json')) {
    return res.json({ ok: true });
  }

  return res.render('contact', {
    pageTitle: 'Contact',
    success: true
  });
}));

app.get('/api/tarifs', asyncHandler(async (req, res) => {
  const tarifs = await readJson('tarifs.json');
  res.json(tarifs);
}));

app.get('/api/equipe', asyncHandler(async (req, res) => {
  const equipe = await readJson('equipe.json');
  res.json(equipe);
}));

app.get('/api/articles', asyncHandler(async (req, res) => {
  const articles = await readJson('articles.json');
  res.json(articles);
}));

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

  return res.status(500).send('Une erreur est survenue : veuillez réessayer plus tard.');
});

app.listen(PORT, () => {
  console.log(`Les Charmettes est disponible sur http://localhost:${PORT}`);
});
