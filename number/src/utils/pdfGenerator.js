import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { TIMETABLE_MAP } from '../constants/timetableMap';
import { COMMON_SCHEDULES } from '../constants/commonSchedules';

export const generateClassPDF = async (classNum, studentData) => {
  const students = studentData[classNum];
  if (!students) {
    alert(`${classNum}반 학생 데이터가 없습니다.`);
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const container = document.createElement('div');
  
  // 캡처용 임시 컨테이너 설정
  container.style.width = '190mm';
  container.style.padding = '10mm';
  container.style.backgroundColor = 'white';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  const studentNums = Object.keys(students).sort();
  const dayKeys = ["mon", "tue", "wed", "thu", "fri"];
  const dayLabels = ["월", "화", "수", "목", "금"];
  const classCommon = COMMON_SCHEDULES[classNum] || {}; 

  for (let i = 0; i < studentNums.length; i++) {
    const sNum = studentNums[i];
    const choices = students[sNum];

    if (i > 0) doc.addPage();

    let tableHtml = `
      <div style="font-family: sans-serif; padding: 10px;">
        <h2 style="text-align: center; margin-bottom: 20px;">부경고등학교 시간표 (${classNum}반 ${sNum}번)</h2>
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; table-layout: fixed;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 12px; width: 50px;">교시</th>
              ${dayLabels.map(d => `<th style="border: 1px solid #dee2e6; padding: 12px;">${d}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;

    for (let pIdx = 0; pIdx < 7; pIdx++) {
      const period = pIdx + 1;
      tableHtml += `<tr><td style="border: 1px solid #dee2e6; padding: 12px; background: #f8f9fa; font-weight: bold;">${period}</td>`;
      
      dayKeys.forEach((day) => {
        const type = TIMETABLE_MAP[day][pIdx];
        let content = "";
        let cellColor = "#ffffff";

        if (type === "BLANK") {
          content = "";
        } else if (type === "FREE") {
          content = "공강";
          cellColor = "#fff5f5";
        } else if (type ==="C1" || type === "C2" || type === "C3" || type === "C4" || type === "C5") {
          // [합치기] 학생 선택 과목 데이터 적용
          const cIdx = type.replace("C", "");
          content = (choices && choices[cIdx]) ? choices[cIdx] : "-";
          cellColor = "#f1f7ff";
        console.log(`선택 과목 적용`);
      
    
    } else  {
          // [합치기] 반별 공통 시간표 데이터 적용
          content = (classCommon[day] && classCommon[day][period]) 
                    ? classCommon[day][period] 
                    : "-";
        console.log(`공통 과목 적용`);    
        }
        
        tableHtml += `<td style="border: 1px solid #dee2e6; padding: 12px; background-color: ${cellColor};">${content}</td>`;
      });
      tableHtml += `</tr>`;
    }

    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;

    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 10, 20, 190, (canvas.height * 190) / canvas.width);
  }

  doc.save(`${classNum}반_전체시간표.pdf`);
  document.body.removeChild(container);
};