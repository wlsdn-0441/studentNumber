import React from 'react';

const Timetable = ({ timetableData, dates }) => {
  const days = ["월", "화", "수", "목", "금"];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const getSubject = (date, period) => {
    const item = timetableData.find(d => d.ALL_TI_YMD === date && parseInt(d.PERIO) === period);
    return item ? item.ITRT_CNTNT : "";
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
              <td className="period">{p}</td>
              {dates.map(d => <td key={d}>{getSubject(d, p)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Timetable;