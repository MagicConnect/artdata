
const path = require('path');
const fs = require('fs-extra');
const readdir = require('recursive-readdir');
const fetch = require('node-fetch');

const Sharp = require('sharp');
Sharp.cache(false);

// TODO: load this and char class from game manifest
const disallowedCharacters = ['BerylVegha'];

const buildJSONForCharacter = (character, stars, image) => ({
  name: `${character.name} ${stars}★`,
  symbol: `MC`,
  description: `The ${stars}★ version of ${character.name}, a(n) ${character.archetype} who wields ${character.weapon}-type weapons.`,
  seller_fee_basis_points: 500,
  image: `${image}.png`,
  attributes: [
    { trait_type: 'Archetype', value: character.archetype },
    { trait_type: 'Weapon', value: character.weapon }, 
    { trait_type: 'Stars', value: stars }
  ],
  properties: {
    creators: [{ address: '8x6U7xLVZFwpyXGnBwJNbitHNMXwZKQWcSnVokfjFvHk', share: 100 }],
    files: [{ uri: `${image}.png`, type: 'image/png' }]
  },
  collection: { name: 'Magic Connect! Characters', family: 'Magic Connect!' }
});

const init = async () => {

  fs.ensureDirSync('dist');

  const gamedata = await fetch(`https://gamedata.magic-connect.com/content.json`);
  const body = await gamedata.json();
  
  const characterData = body.characters;
  
  const urls = [];

  await fs.ensureDir('dist/nft');
  await fs.ensureDir(`dist/nft/meta`);

  const allCharacters = await readdir('assets/art/characters');

  let currentFile = 0;

  for await (const char of allCharacters) {
    if(disallowedCharacters.some(checkChar => char.includes(checkChar))) continue;

    const charFileName = char.split(path.sep).pop().split('.')[0];

    const charRef = characterData.find(c => c.art === charFileName);
    const archetype = charRef ? charRef.archetype.toLowerCase() : null;

    if(!archetype) continue;

    await fs.ensureDir(`dist/nft/${charFileName}`);

    for await (const i of [1, 2, 3, 4, 5]) {
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

      const url = `nft/${charFileName}/${i}.png`;
      urls.push(url);

      await Sharp(`assets/nft/backgrounds/${i}.png`)
        .composite([
          ...(archetype ? [{ input: `assets/nft/circles/${archetype}.png` }] : []),
          { input: charResized, top: FROM_TOP, left: 0 },
          ...(archetype ? [{ input: archetypeResized, top: 50, left: 30 }] : []),
          ...stars,
          { input: `assets/nft/frames/${i}.png` },
        ]).toFile(`dist/${url}`);

      fs.copyFileSync(`dist/${url}`, `dist/nft/meta/${currentFile}.png`);

      const json = buildJSONForCharacter(charRef, i, currentFile);

      fs.writeJSONSync(`dist/nft/meta/${currentFile}.json`, json);

      currentFile++;
    }
  }

  await fs.writeJson('dist/nfts.json', { urls });
};

init();