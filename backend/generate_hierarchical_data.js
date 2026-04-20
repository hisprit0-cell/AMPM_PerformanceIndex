/**
 * 📊 Hierarchical Sales Data Generator
 * Logic: Total -> Division -> Team sums must be consistent.
 */

const generateData = () => {
  const structure = {
    '퍼포먼스1본부': ['영업 1팀', '영업 2팀', '영업 3팀'],
    '퍼포먼스2본부': ['영업 1팀', '영업 2팀', '영업 3팀'],
    '퍼포먼스3본부': ['영업 1팀', '영업 4팀', '영업 5팀']
  };

  const months = [];
  let year = 24, month = 4;
  for (let i = 0; i < 24; i++) {
    months.push(`${year}.${String(month).padStart(2, '0')}`);
    month++;
    if (month > 12) { month = 1; year++; }
  }

  const allRecords = [];

  months.forEach(m => {
    // 1. Monthly Grand Total (15,000 ~ 25,000 만원)
    const monthlyTotalRevenue = 15000 + Math.floor(Math.random() * 10000);
    const monthlyTotalHC = 45 + Math.floor(Math.random() * 15);

    const divisions = Object.keys(structure);
    
    // 2. Distribute to Divisions
    let remainingRev = monthlyTotalRevenue;
    let remainingHC = monthlyTotalHC;
    
    const divValues = {};

    divisions.forEach((div, idx) => {
      if (idx === divisions.length - 1) {
        divValues[div] = { r: remainingRev, h: remainingHC };
      } else {
        const rRatio = 0.25 + (Math.random() * 0.15); // 25% ~ 40%
        const hRatio = 0.25 + (Math.random() * 0.15);
        const r = Math.floor(monthlyTotalRevenue * rRatio);
        const h = Math.floor(monthlyTotalHC * hRatio);
        divValues[div] = { r, h };
        remainingRev -= r;
        remainingHC -= h;
      }
    });

    // 3. Distribute Division totals to Teams
    divisions.forEach(div => {
      const teams = structure[div];
      let tRemainingRev = divValues[div].r;
      let tRemainingHC = divValues[div].h;

      teams.forEach((teamName, tIdx) => {
        let tRev, tHC;
        if (tIdx === teams.length - 1) {
          tRev = tRemainingRev;
          tHC = tRemainingHC;
        } else {
          const trRatio = 0.25 + (Math.random() * 0.15); // 25% ~ 40%
          const thRatio = 0.25 + (Math.random() * 0.15);
          tRev = Math.floor(divValues[div].r * trRatio);
          tHC = Math.floor(divValues[div].h * thRatio);
          tRemainingRev -= tRev;
          tRemainingHC -= tHC;
        }

        allRecords.push({
          month: m,
          division: div,
          team: teamName,
          revenue: tRev,
          headcount: tHC
        });
      });
    });
  });

  return allRecords;
};

async function applyData() {
  const records = generateData();
  console.log(`Generated ${records.length} hierarchical records.`);

  try {
    const response = await fetch('http://localhost:3000/api/sales/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: records })
    });
    const result = await response.json();
    console.log('Upload Result:', result);
  } catch (err) {
    console.error('Upload Failed:', err.message);
  }
}

applyData();
