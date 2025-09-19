const express = require('express');
const asyncHandler = require('../lib/async-handler');
const siteController = require('../controllers/siteController');

const router = express.Router();

router.get('/', asyncHandler(siteController.renderHome));
router.get('/presentation', asyncHandler(siteController.renderPresentation));
router.get('/tarifs', asyncHandler(siteController.renderTarifs));
router.get('/equipe', asyncHandler(siteController.renderEquipe));
router.get('/articles/:slug', asyncHandler(siteController.renderArticle));
router.get('/contact', siteController.renderContactForm);
router.post('/contact', asyncHandler(siteController.submitContactForm));

module.exports = router;

