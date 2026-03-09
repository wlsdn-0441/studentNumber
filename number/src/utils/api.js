export const fetchWeeklyMeals = async (startDate, endDate) => {
  const response = await fetch(`/api/meal?startDate=${startDate}&endDate=${endDate}`);
  const data = await response.json();
  return data.mealServiceDietInfo?.[1]?.row || [];
};

export const fetchWeeklyTimetable = async (grade, classNum, startDate, endDate) => {
  const response = await fetch(`/api/timetable?grade=${grade}&classNum=${classNum}&startDate=${startDate}&endDate=${endDate}`);
  const data = await response.json();
  return data.hisTimetable?.[1]?.row || [];
};