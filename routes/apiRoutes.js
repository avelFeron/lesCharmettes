const express = require('express');
const asyncHandler = require('../lib/async-handler');
const apiController = require('../controllers/apiController');

const router = express.Router();

router.get('/tarifs', asyncHandler(apiController.listTarifs));
router.get('/equipe', asyncHandler(apiController.listEquipe));
router.get('/articles', asyncHandler(apiController.listArticles));

module.exports = router;

