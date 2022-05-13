
const fs = require('fs-extra');

fs.ensureDirSync('dist');

const artdata = require('../dist/artdata.json');

const manifest = `
# Yarn Asset Manifest

## Backgrounds

${artdata.backgrounds.map(x => `* ${x}`).join('\n')}

## Characters

${artdata.characters.map(x => `* ${x}`).join('\n')}

## NPCs

${artdata.npcs.map(x => `* ${x}`).join('\n')}
`;

fs.writeFileSync('dist/yarn.txt', manifest);