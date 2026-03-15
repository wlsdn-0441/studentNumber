import React from 'react';
import { TIMETABLE_MAP } from '../constants/timetableMap';

const Timetable = ({ timetableData, dates, choices }) => {
  const days = ["월", "화", "수", "목", "금"];
  const dayKeys = ["mon", "tue", "wed", "thu", "fri"];
  const periods = [0, 1, 2, 3, 4, 5, 6];

  const renderCell = (dayKey, pIndex, date) => {
    const type = TIMETABLE_MAP[dayKey][pIndex];
    const currentPeriod = (pIndex + 1).toString(); // 교시를 문자열로 변환

    // 1. 금요일 7교시 등 빈칸 처리
    if (type === "BLANK") return <td className="blank-cell"></td>;

    // 2. 나이스 API 데이터 찾기 (날짜와 교시가 모두 일치해야 함)
    // d.PERIO가 "1"인지 1인지 확실치 않으므로 == 로 비교하거나 toString() 사용
    const apiItem = timetableData?.find(
      (d) => d.ALL_TI_YMD === date && d.PERIO.toString() === currentPeriod
    );
    
    // API에서 가져온 과목명 (데이터가 없으면 빈 문자열)
    const apiContent = apiItem ? apiItem.ITRT_CNTNT : "";

    // 3. 공강 칸 처리
    if (type === "FREE") return <td className="free-cell">공강</td>;

    // 4. 선택 과목 칸 처리 (C1, C2...)
    if (type.startsWith("C")) {
      const choiceIdx = type.replace("C", "");
      // 선택 과목 데이터가 있으면 그걸 보여주고, 없으면 API 데이터를 백업으로 보여줌
      const myChoice = choices ? choices[choiceIdx] : null;
      return (
        <td className="choice-cell">
          {myChoice || apiContent || `선택${choiceIdx}`}
        </td>
      );
    }

    // 5. 공통 과목 칸 (COM) 처리
    // 나이스 API에서 가져온 과목명을 그대로 출력
    return (
      <td className="common-cell">
        {apiContent || "-"} 
      </td>
    );
  };

  return (
    <div className="table-container">
      <table className="timetable">
        <thead>
          <tr>
            <th>교시</th>
            {days.map(d => <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {periods.map(p => (
            <tr key={p}>
              <td className="period-label">{p + 1}</td>
              {dayKeys.map((day, dIdx) => renderCell(day, p, dates[dIdx]))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Timetable;