export default async function handler(req, res) {
  const { startDate, endDate } = req.query;
  const { VITE_NEIS_API_KEY, VITE_ATPT_CODE, VITE_SCHUL_CODE } = process.env;

  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${VITE_NEIS_API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${VITE_ATPT_CODE}&SD_SCHUL_CODE=${VITE_SCHUL_CODE}&MLSV_FROM_YMD=${startDate}&MLSV_TO_YMD=${endDate}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "급식 데이터를 가져오지 못했습니다." });
  }
}