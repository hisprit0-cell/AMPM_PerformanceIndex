const xlsx = require('xlsx');
const path = require('path');

async function importData() {
  const filePath = 'd:/_PROJECT/AMPM_PerformanceIndex/TestData/퍼포먼스3본부영업4팀_실적자료_test용데이터.xlsx';
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const apiData = [];
  const monthRegex = /^\d{4}\.\s?\d{2}$/;

  for (const row of data) {
    const name = row['이름'];
    const division = row['본부명'];
    const team = row['팀명'];

    // Skip total rows or empty rows
    if (!name || name.includes('팀원 수') || !division || !team) continue;

    // Iterate through keys to find month columns
    Object.keys(row).forEach(key => {
      if (monthRegex.test(key)) {
        // key format is "2024. 12" -> convert to "24.12"
        const parts = key.split('.');
        const yy = parts[0].trim().slice(2);
        const mm = parts[1].trim();
        const monthKey = `${yy}.${mm}`;

        apiData.push({
          month: monthKey,
          division: division.trim(),
          team: team.trim(),
          name: name.trim(),
          revenue: Math.round(Number(row[key]) || 0),
          headcount: 1 // Since it's an individual member record
        });
      }
    });
  }

  console.log(`Sending ${apiData.length} records to backend...`);

  try {
    const response = await fetch('http://localhost:3000/api/sales/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: apiData })
    });
    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error uploading to backend:', error.message);
  }
}

importData();
