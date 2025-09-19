const contentService = require('../services/contentService');
const mailer = require('../lib/mailer');
const { CONTACT_EMAIL } = require('../config');

async function renderHome(req, res) {
  const [tarifs, articles, equipe] = await Promise.all([
    contentService.getTarifs(),
    contentService.getArticles(),
    contentService.getEquipe()
  ]);

  res.render('index', {
    pageTitle: 'Accueil',
    heroImages: ['header1.svg', 'header2.svg', 'header3.svg'],
    highlightTarifs: tarifs.slice(0, 3),
    latestArticles: articles.slice(0, 3),
    equipe
  });
}

async function renderPresentation(req, res) {
  const equipe = await contentService.getEquipe();
  res.render('presentation', {
    pageTitle: 'La Maison',
    equipe
  });
}

async function renderTarifs(req, res) {
  const tarifs = await contentService.getTarifs();
  res.render('tarifs', {
    pageTitle: 'Nos Tarifs',
    tarifs
  });
}

async function renderEquipe(req, res) {
  const equipe = await contentService.getEquipe();
  res.render('equipe', {
    pageTitle: 'Notre equipe',
    equipe
  });
}

async function renderArticle(req, res) {
  const articles = await contentService.getArticles();
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
}

function renderContactForm(req, res) {
  res.render('contact', {
    pageTitle: 'Contact'
  });
}

async function submitContactForm(req, res) {
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
}

module.exports = {
  renderHome,
  renderPresentation,
  renderTarifs,
  renderEquipe,
  renderArticle,
  renderContactForm,
  submitContactForm
};



