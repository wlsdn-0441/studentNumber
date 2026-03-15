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
        } else if (type === "C1" || type === "C2" || type === "C3" || type === "C4" || type === "C5") {
          const cIdx = type.replace("C", "");
          content = (choices && choices[cIdx]) ? choices[cIdx] : "-";
          cellColor = "#f1f7ff";
        } else {
          content = (classCommon[day] && classCommon[day][period]) 
                    ? classCommon[day][period] 
                    : "-";
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

  // --- 모바일(갤럭시 등) 호환성을 위한 다운로드 로직 수정 ---
  const pdfBlob = doc.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `${classNum}_class_timetable.pdf`; // 모바일 안정성을 위해 파일명 영어 권장
  document.body.appendChild(link);
  link.click();
  
  // 다운로드 후 메모리 정리
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);

  document.body.removeChild(container);
};