
const path = require('path');
const readdir = require('recursive-readdir');

const init = async () => {
  const files = await readdir('assets/art');
  
  const fileHash = {};

  files.forEach(file => {
    if(file.includes('placeholder')) return;
    
    const fileName = path.basename(file, '.png');
    if(fileHash[fileName]) {
      console.error(`Duplicate file name: ${fileName}`);
      process.exit(1);
    }

    fileHash[fileName] = true;
  })
};

init();