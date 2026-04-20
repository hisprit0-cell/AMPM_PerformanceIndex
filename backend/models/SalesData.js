const { DataTypes } = require('sequelize');

/**
 * 📊 SalesData 모델 정의
 * @description 영업팀 월간 실적 데이터 (UPSERT 지원)
 * UNIQUE KEY: (month, division, team) → 동일 기간+본부+팀 데이터 덮어쓰기 지원
 */
module.exports = (sequelize) => {
  const SalesData = sequelize.define('SalesData', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    month: {
      type: DataTypes.STRING(7), // "24.04", "25.12" 등
      allowNull: false,
      comment: '기간 (YY.MM 형식)'
    },
    division: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '본부명 (예: 퍼포먼스1본부)'
    },
    team: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '팀명 (예: 영업 1팀)'
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: '담당자 이름'
    },
    revenue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '매출액 (만원)'
    },
    headcount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '인원 수'
    }
  }, {
    tableName: 'sales_data',
    timestamps: true, // createdAt, updatedAt 자동 관리
    indexes: [
      {
        unique: true,
        fields: ['month', 'division', 'team', 'name'],
        name: 'uq_month_div_team'
      },
      {
        fields: ['month'],
        name: 'idx_month'
      }
    ]
  });

  return SalesData;
};
