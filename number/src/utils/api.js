export const fetchWeeklyMeals = async (startDate, endDate) => {
  const res = await fetch(`/api/meal?startDate=${startDate}&endDate=${endDate}`);
  const data = await res.json();
  return data.mealServiceDietInfo?.[1]?.row || [];
};

export const fetchWeeklyTimetable = async (grade, classNum, startDate, endDate) => {
  const res = await fetch(`/api/timetable?grade=${grade}&classNum=${classNum}&startDate=${startDate}&endDate=${endDate}`);
  const data = await res.json();
  return data.hisTimetable?.[1]?.row || [];
};

export const fetchStudentChoices = async (classNum, studentNum) => {
  const res = await fetch(`/api/get-student?classNum=${classNum}&studentNum=${studentNum}`);
  if (!res.ok) return null;
  return await res.json();
};