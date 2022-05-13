
const fs = require('fs-extra');
const md5 = require('md5');
const md5File = require('md5-file');

const generateManifest = (paths) => {

  fs.ensureDirSync('dist');

  const manifest = {
    meta: {
      hash: ''
    },
    assets: []
  };

  paths.forEach(path => {
    const metadata = fs.readJSONSync(`dist/${path}.json`);
  
    Object.keys(metadata).forEach(key => {
      if(key === 'meta') return;
  
      metadata[key].forEach(name => {
        const path = `${metadata.meta.basePath}/${key}/${name}.${metadata.meta.fileExt}`;
        const hash = md5File.sync(path);

        manifest.assets.push({
          name,
          path,
          hash
        });
      });
    });
  });

  manifest.meta.hash = md5(JSON.stringify(manifest.assets));

  fs.writeJSONSync('dist/manifest.json', manifest);
  fs.writeJSONSync('dist/version.json', { version: manifest.meta.hash });
};

generateManifest(['artdata']);