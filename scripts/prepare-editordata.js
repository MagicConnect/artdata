
const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const readdir = require('recursive-readdir');

const imagemin = require('imagemin');
const webp = require('imagemin-webp');
const pngquant = require('imagemin-pngquant');

const Sharp = require('sharp');
Sharp.cache(false);

const resizes = {
  accessories: { width: 512, height: 512 },
  achievements: { width: 512, height: 512 },
  backgrounds: { width: 2048, height: 1024 },
  banners: { width: 2880, height: 1620 },
  characters: { width: 800, height: 840 },
  charactersheets: null,
  enemies: { width: 512, height: 512 },
  enemysheets: null,
  items: { width: 512, height: 512 },
  maps: null,
  npcs: { width: 800, height: 840 },
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

    const pngquantOpts = { quality: [0.3, 0.5] };
    const webpOpts = { quality: 10 };

    await imagemin([
      `assets/art/${type}/*.png`
    ], `dist/assets/art/${type}`, {
      plugins: [
        pngquant(pngquantOpts)
      ]
    });

    await imagemin([
      `assets/art/${type}/*.png`
    ], `dist/assets/art/${type}`, {
      plugins: [
        webp(webpOpts)
      ]
    });

    if(resizes[type]) {
      const images = await readdir(`dist/assets/art/${type}`, ['placeholder.png']);
      images.forEach(async imagePath => {
        const resizedImage = await Sharp(imagePath).resize(resizes[type].width, resizes[type].height).toBuffer();
        await Sharp(resizedImage).toFile(imagePath);
      });
    }
  });

};

const getAssetJSON = async () => {
  rimraf.sync('dist/assets/art/**/*.webp');
  rimraf.sync('dist/assets/art/**/*.png');

  const allFiles = await readdir('./assets');

  const allFileRefs = {
    meta: {
      fileExt: 'png',
      basePath: 'dist/assets/art'
    }
  };

  allFiles.forEach(file => {
    if(file.includes('nft')) return;

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
