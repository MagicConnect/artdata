
const fs = require('fs-extra');
const readdir = require('recursive-readdir');

const Sharp = require('sharp');
Sharp.cache(false);

const init = async () => {
  
  const urls = [];

  await fs.ensureDir('dist/nft');

  const allCharacters = await readdir('assets/art/characters');

  for await (const i of [1, 2, 3, 4, 5]) {
    if(i !== 5) continue;

    for await (const char of allCharacters) {
      const charResized = await Sharp(char)
        .resize({ 
          width: 640,
          height: 640
        })
        .toBuffer();

      const charFileName = char.split('\\').pop().split('.')[0];

      await fs.ensureDir(`dist/nft/${charFileName}`);

      const stars = Array(i).fill(null).map((_, i) => ({ 
        input: 'assets/nft/star.png',
        top: 30 + (i * 20), 
        left: 600
       }));

      const url = `dist/nft/${charFileName}/${i}.png`;
      urls.push(url);

      await Sharp(`assets/nft/backgrounds/${i}.png`)
        .composite([
          { input: `assets/nft/circles/defender.png` },
          { input: charResized },
          { input: `assets/nft/classes/defender.png`, top: 10, left: 10 },
          ...stars,
          { input: `assets/nft/frame.png` },
        ]).toFile(url);
    }
  }

  await fs.writeJson('dist/nft/manifest.json', { urls });
};

init();