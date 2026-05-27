#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function writePlaceholder(distDir) {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>PantryPal (placeholder)</title>
  </head>
  <body>
    <h1>PantryPal</h1>
    <p>This is a placeholder index.html created by CI because the build did not produce one.</p>
  </body>
</html>`;
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
  console.log('Wrote placeholder dist/index.html');
}

function main() {
  const cwd = process.cwd();
  const distDir = path.join(cwd, 'dist');
  const clientAssetsDir = path.join(distDir, 'client', 'assets');

  if (!fs.existsSync(clientAssetsDir)) {
    console.warn('Client assets directory not found:', clientAssetsDir);
    writePlaceholder(distDir);
    process.exit(0);
  }

  const files = fs.readdirSync(clientAssetsDir);

  // Prefer index-*.js but exclude index.es-*
  let indexJs = files.find(f => /^index-[A-Za-z0-9].*\.js$/.test(f) && !/^index\.es-/.test(f));
  if (!indexJs) {
    indexJs = files.find(f => /^index.*\.js$/.test(f));
  }

  const styleCss = files.find(f => /^style-.*\.css$/.test(f));

  if (!indexJs) {
    console.warn('No index JS found in client assets');
    writePlaceholder(distDir);
    process.exit(0);
  }

  const scriptPath = `./client/assets/${indexJs}`;
  const cssLink = styleCss ? `<link rel="stylesheet" href="./client/assets/${styleCss}" />` : '';

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>PantryPal</title>
    ${cssLink}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${scriptPath}"></script>
  </body>
</html>`;

  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');
  console.log('Wrote dist/index.html ->', path.join('client', 'assets', indexJs));
}

main();
