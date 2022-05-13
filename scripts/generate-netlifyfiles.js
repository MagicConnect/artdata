
const fs = require('fs-extra');

fs.ensureDirSync('dist');
fs.copySync('_headers', 'dist/_headers');

const generateIndex = async () => {

  const generalManifest = await fs.readJson('dist/manifest.json');

  let index = fs.readFileSync('index.template.html', 'utf8');

  index = index.replace('%VERSION%', generalManifest.meta.hash);
  index = index.replace('%DATE%', new Date());

  const assetString = generalManifest.assets.map(x => `
  <li>
    <a href="${x.path}" target="_blank">${x.name}:${x.path}</a> ${x.hash}
  </li>
  `);
  index = index.replace('%ASSETS%', `<ul>${assetString.join('')}</ul>`);

  fs.writeFileSync('dist/index.html', index);
};

generateIndex();