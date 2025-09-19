const contentService = require('../services/contentService');

function normalizePriceValue(rawValue) {
  if (typeof rawValue === 'undefined') {
    return { error: 'missing' };
  }

  const normalized = String(rawValue).trim().replace(',', '.');
  if (!normalized.length) {
    return { error: 'empty' };
  }

  const price = Number.parseFloat(normalized);
  if (!Number.isFinite(price) || price < 0) {
    return { error: 'invalid' };
  }

  return { value: Math.round(price * 100) / 100 };
}

async function renderTarifEditor(req, res, options = {}) {
  const tarifs = await contentService.getTarifs();
  const formValues = options.formValues || tarifs.reduce((acc, item) => {
    acc[item.id] = item.price;
    return acc;
  }, {});

  res.render('admin/tarifs', {
    pageTitle: 'Administration tarifs',
    tarifs,
    formValues,
    success: Boolean(options.success),
    errors: options.errors || []
  });
}

async function updateTarifs(req, res) {
  const tarifs = await contentService.getTarifs();
  const prices = req.body.prices || {};
  const errors = [];

  const updatedTarifs = tarifs.map((tarif) => {
    const result = normalizePriceValue(prices[tarif.id]);
    if (result.error) {
      errors.push({ id: tarif.id, type: result.error });
      return tarif;
    }

    return {
      ...tarif,
      price: result.value
    };
  });

  if (errors.length) {
    res.status(400);
    const formValues = Object.assign({}, prices);
    return renderTarifEditor(req, res, { errors, formValues });
  }

  await contentService.updateTarifs(updatedTarifs);
  return renderTarifEditor(req, res, { success: true });
}

module.exports = {
  renderTarifEditor,
  updateTarifs
};

