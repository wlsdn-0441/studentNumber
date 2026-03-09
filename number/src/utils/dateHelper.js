export const getWeeklyDates = () => {
  const current = new Date();
  const day = current.getDay();
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));

  const dates = [];
  for (let i = 0; i < 5; i++) {
    const tempDate = new Date(monday);
    tempDate.setDate(monday.getDate() + i);
    const yyyy = tempDate.getFullYear();
    const mm = String(tempDate.getMonth() + 1).padStart(2, '0');
    const dd = String(tempDate.getDate()).padStart(2, '0');
    dates.push(`${yyyy}${mm}${dd}`);
  }
  return dates;
};

export const formatDate = (dateStr) => {
  return `${parseInt(dateStr.substring(4, 6))}월 ${parseInt(dateStr.substring(6, 8))}일`;
};