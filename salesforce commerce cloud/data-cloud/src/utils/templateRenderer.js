const fs = require('node:fs');
const path = require('node:path');

const templateDir = path.join(__dirname, '..', 'templates');

function renderTemplate(res, fileName, statusCode = 200) {
  const fullPath = path.join(templateDir, fileName);
  const html = fs.readFileSync(fullPath, 'utf8');
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

module.exports = { renderTemplate };
