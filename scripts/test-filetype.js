
const readdir = require('recursive-readdir');

const init = async () => {
  const files = await readdir('assets/art');
  
  const nonPNG = files.filter(x => !x.includes('.png'));
  
  if(nonPNG.length > 0) {
    console.log('Non-PNG files found:', nonPNG);
    process.exit(1);
  }
};

init();