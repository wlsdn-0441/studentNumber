import React from 'react';
import { formatDate } from '../utils/dateHelper';

const MealList = ({ mealData, weeklyDates }) => {
  // 1. 해당 주간 데이터 필터링 후 날짜 및 식사 시간순(MMEAL_SC_CODE) 정렬
  const sortedMeals = mealData
    .filter(meal => weeklyDates.includes(meal.MLSV_YMD))
    .sort((a, b) => {
      if (a.MLSV_YMD !== b.MLSV_YMD) {
        return a.MLSV_YMD.localeCompare(b.MLSV_YMD);
      }
      return a.MMEAL_SC_CODE.localeCompare(b.MMEAL_SC_CODE);
    });

  const cleanMenu = (menu) => {
    return menu.replace(/[0-9.()]/g, "").split("<br/>").join(", ");
  };

  return (
    <div className="meal-list">
      {sortedMeals.length > 0 ? (
        sortedMeals.map((meal, i) => (
          <div key={i} className="meal-item">
            <div className="meal-header">
              <span className="date">
                {formatDate(meal.MLSV_YMD)} - {meal.MMEAL_SC_NM}
              </span>
              <span className="kcal">{meal.CAL_INFO}</span>
            </div>
            <div className="menu">{cleanMenu(meal.DDISH_NM)}</div>
          </div>
        ))
      ) : (
        <div className="status-msg">이번 주 급식 정보가 없습니다.</div>
      )}
    </div>
  );
};

export default MealList;