const express = require('express');
const asyncHandler = require('../lib/async-handler');
const basicAuth = require('../middlewares/basicAuth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(basicAuth);
router.get('/', (req, res) => {
  res.redirect('/admin/tarifs');
});
router.get('/tarifs', asyncHandler(adminController.renderTarifEditor));
router.post('/tarifs', asyncHandler(adminController.updateTarifs));

module.exports = router;
