
const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const readdir = require('recursive-readdir');

const imagemin = require('imagemin');
const webp = require('imagemin-webp');

const resizes = {
  accessories: { width: 512, height: 512 },
  achievements: { width: 512, height: 512 },
  backgrounds: { width: 2048, height: 1024 },
  banners: { width: 1024, height: 512 },
  characters: { width: 512, height: 512 },
  charactersheets: null,
  enemies: { width: 512, height: 512 },
  enemysheets: null,
  items: { width: 512, height: 512 },
  maps: { width: 2048, height: 1024 },
  npcs: { width: 512, height: 512 },
  skillicons: { width: 256, height: 256 },
  weapons: { width: 512, height: 512 }
}

const compressImages = async () => {

  [
    'accessories', 
    'achievements', 
    'backgrounds',
    'banners', 
    'characters',
    'charactersheets', 
    'enemies', 
    'enemysheets',
    'items', 
    'maps', 
    'npcs',
    'skillicons',
    'weapons'
  ].forEach(async type => {

    const opts = { quality: 5 };

    if(resizes[type]) {
      opts.resize = resizes[type];
    }

    await imagemin([
      `assets/art/${type}/*.png`
    ], `assets/art/${type}`, {
      plugins: [
        webp(opts)
      ]
    });
  });

};

const getAssetJSON = async () => {
  rimraf.sync('assets/art/**/*.webp');

  const allFiles = await readdir('./assets');

  const allFileRefs = {
    meta: {
      fileExt: 'webp',
      basePath: 'assets/art'
    }
  };

  allFiles.forEach(file => {
    const fileData = path.parse(file);
    const fileName = fileData.name;
    const fileType = fileData.dir.split(path.sep)[2];

    if(fileData.ext !== '.png') {
      console.error(`Error: ${file} is not a png file. Skipping...`);
      return;
    }

    allFileRefs[fileType] = allFileRefs[fileType] || [];
    allFileRefs[fileType].push(fileName);
  });

  Object.keys(allFileRefs).forEach(key => {
    if(key === 'meta') return;

    allFileRefs[key] = allFileRefs[key].filter(x => !x.includes('placeholder'));
  });

  fs.writeJSONSync('artdata.json', allFileRefs);

};

compressImages();
getAssetJSON();
