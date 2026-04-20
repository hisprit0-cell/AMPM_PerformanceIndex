const xlsx = require('xlsx');
const path = require('path');

const filePath = 'd:/_PROJECT/AMPM_PerformanceIndex/TestData/퍼포먼스3본부영업4팀_실적자료_test용데이터.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

console.log('--- Data Count ---');
console.log(data.length);
console.log('--- Data Sample ---');
console.log(JSON.stringify(data.slice(0, 3), null, 2));
console.log('--- Columns ---');
console.log(Object.keys(data[0] || {}));

// Check if there are member names
const members = [...new Set(data.map(d => d['담당자 이름'] || d['성명'] || d['이름'] || d['Name']))].filter(Boolean);
console.log('--- Found Members ---');
console.log(members);
