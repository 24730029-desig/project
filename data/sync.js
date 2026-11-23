// data/sync.js
const fs = require('fs');
const path = require('path');

// 같은 data 폴더 안의 실제 파일명으로 연결
const jsonPath = path.join(__dirname, 'certificates.json');
const jsPath = path.join(__dirname, 'certificates.js');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// 기존 certificates.js의 export 방식과 동일하게 맞추세요
const output = `export const certificates = ${JSON.stringify(data, null, 2)};\n`;

fs.writeFileSync(jsPath, output, 'utf8');
console.log(`총 ${data.length}개 항목이 certificates.js에 동기화되었습니다.`);