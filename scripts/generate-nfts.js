
const path = require('path');
const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const fetch = require('node-fetch');

const Sharp = require('sharp');
Sharp.cache(false);

// TODO: load this and char class from game manifest
const disallowedCharacters = ['BerylVegha'];

const init = async () => {

  fs.ensureDirSync('dist');

  const gamedata = await fetch(`https://gamedata.magic-connect.com/content.json`);
  const body = await gamedata.json();
  
  const characterData = body.characters;
  
  const urls = [];

  await fs.ensureDir('dist/nft');

  const allCharacters = await readdir('assets/art/characters');

  for await (const char of allCharacters) {
    if(disallowedCharacters.some(checkChar => char.includes(checkChar))) continue;

    const charFileName = char.split(path.sep).pop().split('.')[0];

    await fs.ensureDir(`dist/nft/${charFileName}`);

    const charRef = characterData.find(c => c.art === charFileName);
    const archetype = charRef ? charRef.archetype.toLowerCase() : null;

    for await (const i of [1, 2, 3, 4, 5]) {
      if(i !== 5) continue;

      const FROM_TOP = 50;
      
      const charResized = await Sharp(char)
        .resize({ 
          width: 640,
          height: 640,
          fit: 'contain'
        })
        .extract({
          left: 0,
          width: 640,
          top: 0,
          height: 640 - FROM_TOP
        })
        .toBuffer();

      const archetypeResized = archetype ? await Sharp(`assets/nft/classes/${archetype}.png`)
        .resize({
          width: 64,
          height: 64
        })
        .toBuffer()
      : null;

      const stars = Array(i).fill(null).map((_, i) => ({ 
        input: 'assets/nft/star.png',
        top: 50 + (i * 20), 
        left: 580
       }));

      const url = `dist/nft/${charFileName}/${i}.png`;
      urls.push(url);

      await Sharp(`assets/nft/backgrounds/${i}.png`)
        .composite([
          { input: `assets/nft/circles/defender.png` },
          { input: charResized, top: FROM_TOP, left: 0 },
          ...(archetype ? [{ input: archetypeResized, top: 50, left: 30 }] : []),
          ...stars,
          { input: `assets/nft/frame.png` },
        ]).toFile(url);
    }
  }

  await fs.writeJson('dist/nfts.json', { urls });
};

init();