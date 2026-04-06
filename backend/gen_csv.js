const fs = require('fs');
const path = require('path');

const domains = [
  'www.ampm.co.kr', 'chat.ampm.co.kr', 'home.ampm.co.kr', 
  'inside.ampm.co.kr', 'video.ampm.co.kr', 'rfp.ampm.co.kr', 
  'keyword.ampm.co.kr', 'item.ampm.co.kr', 'portfolio.ampm.co.kr', 
  'www.ampmglobal.co.kr'
];

const categories = Array(24).fill(0).map((_, i) => (i < 6 ? '2022.' : i < 18 ? '2023.' : '2024.') + String((i % 12 + 7) % 12 || 12).padStart(2, '0'));

let csvContent = '\uFEFFDomain,Month,UV,PV\n'; 

const allData = [];

// Prepare data for each month and domain
categories.forEach(m => {
    let monthTotalUV = 0;
    let monthTotalPV = 0;
    
    domains.forEach(d => {
        const uv = Math.floor(2000 + Math.random() * 18000); // 0 ~ 20k range (approx)
        const pv = Math.floor(10000 + Math.random() * 90000); // 0 ~ 100k range (approx)
        allData.push({ d, m, uv, pv });
        monthTotalUV += uv;
        monthTotalPV += pv;
    });
    
    // Add "전체" for this month
    allData.push({ d: '전체', m, uv: monthTotalUV, pv: monthTotalPV });
});

// Sort or organize to put "전체" first or just write everything
allData.forEach(item => {
    csvContent += `${item.d},${item.m},${item.uv},${item.pv}\n`;
});

const targetPath = path.join('d:', '_PROJECT', 'AMPM_PerformanceIndex', 'backend', 'dev_traffic_data.csv');
fs.writeFileSync(targetPath, csvContent, 'utf8');
console.log('Dynamic CSV generated at: ' + targetPath);
