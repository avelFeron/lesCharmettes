const path = require('path');
const fs = require('fs/promises');
const { DATA_DIR } = require('../config');

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

async function writeJson(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, payload, 'utf8');
  const stats = await fs.stat(filePath);
  dataCache.set(filePath, { mtimeMs: stats.mtimeMs, data });
  return data;
}

function clearCache() {
  dataCache.clear();
}

async function getTarifs() {
  return readJson('tarifs.json');
}

async function updateTarifs(tarifs) {
  return writeJson('tarifs.json', tarifs);
}

async function getArticles() {
  return readJson('articles.json');
}

async function getEquipe() {
  return readJson('equipe.json');
}

module.exports = {
  getTarifs,
  updateTarifs,
  getArticles,
  getEquipe,
  readJson,
  writeJson,
  clearCache
};
