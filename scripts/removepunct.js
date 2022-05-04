
const fs = require('fs-extra');
const readdir = require('recursive-readdir');

const init = async () => {
  const files = await readdir('assets/art');
  const images = files.filter(file => file.endsWith('.png'));
  
  images.forEach(image => {
    const cleanName = image.split('-').join('').split('&').join('').split('_').join('');
    fs.rename(image, cleanName);
  });
};

init();