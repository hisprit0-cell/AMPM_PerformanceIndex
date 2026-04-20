const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

const config = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'gn1dmpg',
  database: process.env.DB_NAME || 'ampm_performance'
};

const structure = {
  '퍼포먼스1본부': {
    '영업 1팀': ['김철수', '이영희', '박지성', '최동훈', '정미경', '한재석', '송혜교'],
    '영업 2팀': ['유재석', '강호동', '박명수', '노홍철', '정준하', '하동훈', '길성준'],
    '영업 3팀': ['이효리', '옥주현', '이진', '성유리', '김완선', '엄정화', '바다']
  },
  '퍼포먼스2본부': {
    '영업 1팀': ['손흥민', '황희찬', '이강인', '김민재', '황인범', '조규성', '백승호'],
    '영업 2팀': ['이상혁', '배성웅', '정언영', '채광진', '구본택', '김종인', '허원석'],
    '영업 3팀': ['조용필', '나훈아', '남진', '이미자', '송창식', '윤형주', '김세환']
  },
  '퍼포먼스3본부': {
    '영업 1팀': ['봉준호', '송강호', '박해일', '배두나', '변희봉', '고아성', '김뢰하'],
    '영업 4팀': ['박찬욱', '최민식', '유지태', '강혜정', '김병옥', '오달수', '윤진서'],
    '영업 5팀': ['나홍진', '김윤석', '하정우', '서영희', '박효주', '정인기', '구본웅']
  }
};

async function run() {
  const connection = await mysql.createConnection(config);
  console.log('Connected to DB');

  // Month range: 24.04 ~ 26.03
  const months = [];
  let year = 24, month = 4;
  for (let i = 0; i < 24; i++) {
    months.push(`${year}.${String(month).padStart(2, '0')}`);
    month++;
    if (month > 12) { month = 1; year++; }
  }

  const allRecords = [];

  months.forEach((m, mIdx) => {
    // Current Monthly target: Total Revenue ~4M, Total HC ~66
    // We add some growth over time
    const growthFactor = 0.9 + (mIdx / 23) * 0.2; // 0.9 ~ 1.1 (Stable growth)
    const baseMonthlyRev = (148000 + Math.random() * 4000) * growthFactor;
    const baseMonthlyHC = 63 + Math.floor(Math.random() * 5);

    let remainingRev = baseMonthlyRev;
    let remainingHC = baseMonthlyHC;

    const divisions = Object.keys(structure);
    divisions.forEach((divName, dIdx) => {
      let divRev, divHC;
      if (dIdx === divisions.length - 1) {
        divRev = remainingRev;
        divHC = remainingHC;
      } else {
        const rRatio = 0.3 + Math.random() * 0.05;
        const hRatio = 1 / divisions.length; 
        divRev = baseMonthlyRev * rRatio;
        divHC = Math.floor(baseMonthlyHC * hRatio);
        remainingRev -= divRev;
        remainingHC -= divHC;
      }

      const teams = Object.keys(structure[divName]);
      let tRemainingRev = divRev;
      let tRemainingHC = divHC;

      teams.forEach((teamName, tIdx) => {
        let teamRev, teamHC;
        if (tIdx === teams.length - 1) {
          teamRev = tRemainingRev;
          teamHC = tRemainingHC;
        } else {
          const trRatio = 0.3 + Math.random() * 0.05;
          const thRatio = 1 / teams.length;
          teamRev = divRev * trRatio;
          teamHC = Math.floor(divHC * thRatio);
          tRemainingRev -= teamRev;
          tRemainingHC -= teamHC;
        }

        const members = structure[divName][teamName];
        let mRemainingRev = teamRev;
        
        members.forEach((memberName, memIdx) => {
          let memRev;
          if (memIdx === members.length - 1) {
            memRev = mRemainingRev;
          } else {
            const mrRatio = (1 / members.length) + (Math.random() * 0.05 - 0.025);
            memRev = teamRev * mrRatio;
            mRemainingRev -= memRev;
          }

          allRecords.push([
            m,
            divName,
            teamName,
            memberName,
            Math.round(memRev),
            1 // Each member counts as 1 HC
          ]);
        });
      });
    });
  });

  console.log(`Prepared ${allRecords.length} member records.`);

  // Batch insert
  const sql = 'INSERT INTO sales_data (month, division, team, name, revenue, headcount, createdAt, updatedAt) VALUES ? ON DUPLICATE KEY UPDATE revenue=VALUES(revenue), headcount=VALUES(headcount), updatedAt=NOW()';
  const now = new Date();
  const valuesWithTime = allRecords.map(r => [...r, now, now]);

  // Split into chunks of 500 to avoid packet size limit
  for (let i = 0; i < valuesWithTime.length; i += 500) {
    const chunk = valuesWithTime.slice(i, i + 500);
    await connection.query(sql, [chunk]);
    console.log(`Uploaded chunk ${i / 500 + 1}`);
  }

  console.log('Final Total Revenue:', Math.round(allRecords.reduce((a,c) => a+c[4], 0)).toLocaleString(), '만원');
  console.log('Finished!');
  await connection.end();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
