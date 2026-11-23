// data/sync.js
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'certificates.json');
const jsPath = path.join(__dirname, 'certificates.js');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
fs.writeFileSync(jsPath, `window.CERTIFICATES_DATA = ${JSON.stringify(data)};\n`, 'utf8');
console.log(`총 ${data.length}개 항목 동기화 완료`);