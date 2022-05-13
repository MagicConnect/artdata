
const readdir = require('recursive-readdir');
const fs = require('fs-extra');
const sharp = require('sharp');

const init = async () => {
  const files = await readdir('assets/art');
  
  const nonPNG = files.filter(x => !x.includes('.png'));
  
  nonPNG.forEach(async file => {
    await sharp(file)
      .toFile(file.replace(/\.[^/.]+$/, '.png'));

    await fs.rm(file);
  });
};

init();