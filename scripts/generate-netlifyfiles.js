
const fs = require('fs-extra');

fs.ensureDirSync('dist');
fs.copySync('_headers', 'dist/_headers');