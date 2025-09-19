const contentService = require('../services/contentService');

async function listTarifs(req, res) {
  const tarifs = await contentService.getTarifs();
  res.json(tarifs);
}

async function listEquipe(req, res) {
  const equipe = await contentService.getEquipe();
  res.json(equipe);
}

async function listArticles(req, res) {
  const articles = await contentService.getArticles();
  res.json(articles);
}

module.exports = {
  listTarifs,
  listEquipe,
  listArticles
};

